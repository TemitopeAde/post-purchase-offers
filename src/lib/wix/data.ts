import { items } from '@wix/data';
import { auth } from '@wix/essentials';
import type { Campaign, Offer, OfferEvent, AppSettings } from '../types';

export const APP_NAMESPACE = '@admin14744/post-purchase-offers';

export const COLLECTIONS = {
  CAMPAIGNS: `${APP_NAMESPACE}/campaigns`,
  OFFERS: `${APP_NAMESPACE}/offers`,
  OFFER_EVENTS: `${APP_NAMESPACE}/offer-events`,
  APP_SETTINGS: `${APP_NAMESPACE}/app-settings`,
} as const;

const elevatedQuery = auth.elevate(items.query);
const elevatedInsert = auth.elevate(items.insert);
const elevatedUpdate = auth.elevate(items.update);
const elevatedRemove = auth.elevate(items.remove);
const elevatedSave = auth.elevate(items.save);

// In-memory fallback stores when running in mock / preview environment or before collection publish
const memoryCampaigns: Map<string, Campaign> = new Map();
const memoryOffers: Map<string, Offer> = new Map();
const memoryEvents: OfferEvent[] = [];
let memorySettings: AppSettings = {
  aiEnabled: true,
  defaultRecommendationMode: 'AI',
  maxRecommendations: 2,
  defaultFallbackMode: 'RULES',
  headline: 'A little something extra for you',
  subheadline: 'Exclusive post-purchase deals selected specifically for your order.',
  accentColor: '#3899ec',
  buttonColor: '#116dff',
  buttonTextColor: '#ffffff',
  borderRadius: 8,
  enableAiExplanations: true,
  plan: 'Pro',
  monthlyAiUsage: 0,
};

const getStartOfCurrentMonth = () => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
};

// --- Campaigns CRUD ---
export async function getCampaigns(): Promise<Campaign[]> {
  try {
    const res = await elevatedQuery(COLLECTIONS.CAMPAIGNS).find();
    if (res.items && res.items.length > 0) {
      return res.items as unknown as Campaign[];
    }
  } catch (err) {
    console.warn('Wix Data query failed (using in-memory store):', err);
  }
  return Array.from(memoryCampaigns.values()).filter((c) => c.status !== 'archived');
}

export async function getCampaignById(id: string): Promise<Campaign | null> {
  try {
    const res = await elevatedQuery(COLLECTIONS.CAMPAIGNS).eq('_id', id).limit(1).find();
    if (res.items && res.items.length > 0) return res.items[0] as unknown as Campaign;
  } catch (err) {
    // fallback
  }
  return memoryCampaigns.get(id) || null;
}

export async function createCampaign(campaign: Omit<Campaign, '_id'>): Promise<Campaign> {
  const newCamp: Campaign = {
    ...campaign,
    _id: `camp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    _createdDate: new Date().toISOString(),
    _updatedDate: new Date().toISOString(),
  };

  try {
    const res = await elevatedInsert(COLLECTIONS.CAMPAIGNS, newCamp as any);
    if (res && res._id) {
      memoryCampaigns.set(res._id, res as unknown as Campaign);
      return res as unknown as Campaign;
    }
  } catch (err) {
    console.warn('Wix Data insert failed (saving in memory):', err);
  }

  memoryCampaigns.set(newCamp._id!, newCamp);
  return newCamp;
}

export async function updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign | null> {
  const existing = await getCampaignById(id);
  if (!existing) return null;

  const merged: Campaign = {
    ...existing,
    ...updates,
    _updatedDate: new Date().toISOString(),
  };

  try {
    await elevatedUpdate(COLLECTIONS.CAMPAIGNS, merged as any);
  } catch (err) {
    console.warn('Wix Data update failed (updating in memory):', err);
  }

  memoryCampaigns.set(id, merged);
  return merged;
}

export async function deleteCampaign(id: string): Promise<boolean> {
  try {
    await elevatedRemove(COLLECTIONS.CAMPAIGNS, id);
  } catch (err) {
    // fallback
  }
  return memoryCampaigns.delete(id);
}

// --- Offers CRUD ---
export async function getOffersByCampaign(campaignId: string): Promise<Offer[]> {
  try {
    const res = await elevatedQuery(COLLECTIONS.OFFERS).eq('campaignId', campaignId).find();
    if (res.items && res.items.length > 0) {
      return res.items as unknown as Offer[];
    }
  } catch (err) {
    // fallback
  }
  return Array.from(memoryOffers.values()).filter((o) => o.campaignId === campaignId);
}

export async function saveOffer(offer: Offer): Promise<Offer> {
  const item: Offer = {
    ...offer,
    _id: offer._id || `offer_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
  };

  try {
    await elevatedSave(COLLECTIONS.OFFERS, item as any);
  } catch (err) {
    // fallback
  }

  memoryOffers.set(item._id!, item);
  return item;
}

// --- Offer Events & Analytics ---
export async function recordOfferEvent(event: Omit<OfferEvent, '_id' | '_createdDate'>): Promise<OfferEvent> {
  const item: OfferEvent = {
    ...event,
    _id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    _createdDate: new Date().toISOString(),
  };

  try {
    await elevatedInsert(COLLECTIONS.OFFER_EVENTS, item as any);
  } catch (err) {
    // fallback
  }

  memoryEvents.push(item);
  return item;
}

export async function getOfferEvents(): Promise<OfferEvent[]> {
  try {
    const res = await elevatedQuery(COLLECTIONS.OFFER_EVENTS).limit(500).find();
    if (res.items && res.items.length > 0) {
      return res.items as unknown as OfferEvent[];
    }
  } catch (err) {
    // fallback
  }
  return [...memoryEvents];
}

export async function getMonthlyAiUsage(): Promise<number> {
  const startOfMonth = getStartOfCurrentMonth();

  try {
    return await elevatedQuery(COLLECTIONS.OFFER_EVENTS)
      .eq('eventType', 'recommendation_request')
      .ge('_createdDate', startOfMonth)
      .count();
  } catch (err) {
    return memoryEvents.filter(
      (event) => event.eventType === 'recommendation_request' && (event._createdDate || '') >= startOfMonth,
    ).length;
  }
}

// --- App Settings ---
export async function getAppSettings(): Promise<AppSettings> {
  try {
    const res = await elevatedQuery(COLLECTIONS.APP_SETTINGS).limit(1).find();
    if (res.items && res.items.length > 0) {
      const settings = res.items[0] as unknown as AppSettings;
      return { ...settings, monthlyAiUsage: await getMonthlyAiUsage() };
    }
  } catch (err) {
    // fallback
  }
  return { ...memorySettings, monthlyAiUsage: await getMonthlyAiUsage() };
}

export async function updateAppSettings(updates: Partial<AppSettings>): Promise<AppSettings> {
  memorySettings = {
    ...memorySettings,
    ...updates,
  };

  try {
    await elevatedSave(COLLECTIONS.APP_SETTINGS, memorySettings as any);
  } catch (err) {
    // fallback
  }

  return { ...memorySettings };
}
