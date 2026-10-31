import type { Campaign, Offer, ProductCandidate } from '../types';
import { resolveLocale, translate } from '../i18n';
import { getCampaigns, getOffersByCampaign, getAppSettings, recordOfferEvent, getMonthlyAiUsage } from '../wix/data';
import { getPlanContext } from '../wix/billing';
import { getProductCandidates, getProductDetails } from '../wix/catalog';
import { getOrderContext, type OrderContext } from '../wix/orders';
import { defaultDeepSeekProvider } from '../ai/providers/deepseek';
import { rankCandidatesDeterministically, mergeAiRankingsWithOffers } from './ranking';

export interface RecommendationResponse {
  campaign: {
    id: string;
    name: string;
    heading: string;
    subheading: string;
    ctaText: string;
  };
  offers: Offer[];
  orderId?: string;
  source: 'ai' | 'rules' | 'manual' | 'hybrid';
  locale: string;
}

export function isCampaignEligible(campaign: Campaign, order: OrderContext): boolean {
  if (campaign.status !== 'active') return false;

  const now = new Date();
  if (campaign.startAt && new Date(campaign.startAt) > now) return false;
  if (campaign.endAt && new Date(campaign.endAt) < now) return false;

  if (campaign.minOrderSubtotal !== undefined && campaign.minOrderSubtotal > 0) {
    if (order.subtotal < campaign.minOrderSubtotal) return false;
  }
  if (campaign.maxOrderSubtotal !== undefined && campaign.maxOrderSubtotal > 0) {
    if (order.subtotal > campaign.maxOrderSubtotal) return false;
  }

  // Trigger products check
  if (campaign.triggerProductIds && campaign.triggerProductIds.length > 0) {
    const hasTrigger = campaign.triggerProductIds.some((id) =>
      order.purchasedProductIds.includes(id)
    );
    if (!hasTrigger) return false;
  }

  return true;
}

export async function generateOffersForOrder(
  orderId: string
): Promise<RecommendationResponse | null> {
  console.info('[Post-Purchase Offers][Recommendations] Flow started', { orderId });
  const [order, campaigns, settings, { limits }] = await Promise.all([
    getOrderContext(orderId),
    getCampaigns(),
    getAppSettings(),
    getPlanContext(),
  ]);

  // No paid plan or trial in progress: the app is inactive on this site.
  if (!limits) {
    console.warn('[Post-Purchase Offers][Recommendations] Flow stopped: no active plan limits');
    return null;
  }

  // If order cannot be validated from Wix, return null to avoid unauthorized offers
  if (!order) {
    console.warn('[Post-Purchase Offers][Recommendations] Flow stopped: order validation failed', { orderId });
    return null;
  }

  // Find eligible campaigns, sorted by priority descending
  const eligibleCampaigns = campaigns
    .filter((c) => isCampaignEligible(c, order))
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  if (eligibleCampaigns.length === 0) {
    console.info('[Post-Purchase Offers][Recommendations] Flow stopped: no eligible campaigns', {
      campaignCount: campaigns.length,
    });
    return null;
  }

  const campaign = eligibleCampaigns[0];
  // Manual campaigns should display every product the merchant selected.
  // AI and Hybrid remain bounded because they generate recommendations.
  const requestedMaxOffers = campaign.maxOffers || settings.maxRecommendations || 4;
  const maxOffers = campaign.recommendationMode === 'MANUAL'
    ? Math.max(requestedMaxOffers, 1)
    : Math.max(requestedMaxOffers, 4);

  // Exclude products already bought in this order plus campaign exclusions
  const excludedIds = [
    ...order.purchasedProductIds,
    ...(campaign.excludedProductIds || []),
  ];

  const candidates = await getProductCandidates({
    excludeProductIds: excludedIds,
    maxLimit: 25,
  });

  const purchasedProducts = await Promise.all(
    order.purchasedProducts.map(async (product) => {
      const details = await getProductDetails(product.productId);
      return {
        ...product,
        category: details?.category,
        description: product.description || details?.description,
      };
    }),
  );

  const candidateMap = new Map<string, ProductCandidate>(
    candidates.map((c) => [c.productId, c])
  );

  let finalOffers: Offer[] = [];
  let source: 'ai' | 'rules' | 'manual' | 'hybrid' = 'rules';

  // 1. Use merchant-selected offers first for MANUAL and HYBRID campaigns.
  if ((campaign.recommendationMode === 'MANUAL' || campaign.recommendationMode === 'HYBRID') && campaign._id) {
    const manualOffers = await getOffersByCampaign(campaign._id);
    finalOffers = manualOffers
      .filter((o) => o.active && !order.purchasedProductIds.includes(o.productId))
      .sort((a, b) => (a.priority || 0) - (b.priority || 0))
      .map((offer) => ({ ...offer, currency: offer.currency || candidateMap.get(offer.productId)?.currency }))
      .slice(0, campaign.recommendationMode === 'MANUAL' ? undefined : maxOffers);
    source = 'manual';
  }

  // 2. Try AI recommendation if enabled and mode is AI or HYBRID
  const shouldTryAi =
    (campaign.recommendationMode === 'AI' || campaign.recommendationMode === 'HYBRID') &&
    settings.aiEnabled &&
    defaultDeepSeekProvider.isConfigured() &&
    candidates.length > 0;

  console.info('[Post-Purchase Offers][Recommendations] AI eligibility evaluated', {
    campaignId: campaign._id ?? null,
    recommendationMode: campaign.recommendationMode,
    settingsAiEnabled: settings.aiEnabled,
    providerConfigured: defaultDeepSeekProvider.isConfigured(),
    candidateCount: candidates.length,
    shouldTryAi,
  });

  const withinAiAllowance =
    shouldTryAi && (await getMonthlyAiUsage()) < limits.monthlyAiRecommendations;

  console.info('[Post-Purchase Offers][Recommendations] AI allowance evaluated', {
    shouldTryAi,
    withinAiAllowance,
    monthlyLimit: limits.monthlyAiRecommendations,
  });

  if (withinAiAllowance && finalOffers.length < maxOffers) {
    try {
      console.info('[Post-Purchase Offers][Recommendations] Calling DeepSeek', {
        remainingSlots: maxOffers - finalOffers.length,
      });
      await recordOfferEvent({
        campaignId: campaign._id || 'unknown',
        productId: '__ai_recommendation_request__',
        originalOrderId: order.orderId,
        eventType: 'recommendation_request',
        sessionKey: `ai_${order.orderId}_${Date.now()}`,
        aiRecommended: true,
      });

      const aiResult = await defaultDeepSeekProvider.recommend({
        currency: order.currency,
        purchasedProducts,
        candidates,
        maxRecommendations: maxOffers - finalOffers.length,
      });

      console.info('[Post-Purchase Offers][Recommendations] DeepSeek result received', {
        recommendationCount: aiResult.recommendations.length,
      });

      if (aiResult.recommendations.length > 0) {
        const aiOffers = mergeAiRankingsWithOffers(
          aiResult.recommendations,
          candidateMap,
          campaign
        );
        finalOffers = [...finalOffers, ...aiOffers];
        source = campaign.recommendationMode === 'HYBRID' && finalOffers.length > 0 ? 'hybrid' : 'ai';
      }
    } catch (err) {
      console.error('[Post-Purchase Offers][Recommendations] AI recommendation failed; falling back to rules', {
        message: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  // 3. Fallback to deterministic rules if needed
  if (finalOffers.length === 0 && campaign.fallbackMode === 'MANUAL' && campaign._id) {
    const manualOffers = await getOffersByCampaign(campaign._id);
    finalOffers = manualOffers
      .filter((o) => o.active && !order.purchasedProductIds.includes(o.productId))
      .sort((a, b) => (a.priority || 0) - (b.priority || 0))
      .map((offer) => ({ ...offer, currency: offer.currency || candidateMap.get(offer.productId)?.currency }))
      .slice(0, maxOffers);
    source = 'manual';
  }

  if (finalOffers.length === 0 && campaign.fallbackMode === 'RULES') {
    console.info('[Post-Purchase Offers][Recommendations] Using deterministic fallback', {
      fallbackMode: campaign.fallbackMode,
      candidateCount: candidates.length,
    });
    finalOffers = rankCandidatesDeterministically(candidates, {
      orderSubtotal: order.subtotal,
      purchasedCategories: purchasedProducts
        .map((product) => product.category)
        .filter((category): category is string => Boolean(category)),
      maxOffers,
      campaign,
    });
    source = 'rules';
  }

  if (finalOffers.length === 0) {
    return null;
  }

  const configuredLocale = resolveLocale(settings.locale);
  const isDefaultHeading =
    !campaign.displayHeading &&
    (!settings.headline ||
      settings.headline === 'A little something extra for you' ||
      settings.headline === 'Special Offer' ||
      settings.headline === 'Post-Purchase Deals');
  const isDefaultSubheading =
    !campaign.displaySubheading &&
    (!settings.subheadline ||
      settings.subheadline === 'Exclusive post-purchase deals selected specifically for your order.' ||
      settings.subheadline === 'Complementary picks tailored to your order.' ||
      settings.subheadline === 'A little something extra for you!' ||
      settings.subheadline === 'Add these complementary items to your order with one click.');
  const isDefaultCta =
    !campaign.ctaText ||
    campaign.ctaText === 'Claim Offer' ||
    campaign.ctaText === 'Add to Order' ||
    campaign.ctaText === 'Add to Order →';

  return {
    campaign: {
      id: campaign._id || 'default',
      name: campaign.name,
      heading: isDefaultHeading
        ? translate(configuredLocale, 'previewHeading')
        : (campaign.displayHeading || settings.headline!),
      subheading: isDefaultSubheading
        ? translate(configuredLocale, 'previewSubheading')
        : (campaign.displaySubheading || settings.subheadline!),
      ctaText: isDefaultCta
        ? translate(configuredLocale, 'claimOffer')
        : (campaign.ctaText || translate(configuredLocale, 'claimOffer')),
    },
    offers: campaign.recommendationMode === 'MANUAL'
      ? finalOffers
      : finalOffers.slice(0, maxOffers),
    orderId: order.orderId,
    source,
    locale: configuredLocale,
  };
}
