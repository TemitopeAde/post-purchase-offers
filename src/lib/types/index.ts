export type CampaignStatus = 'draft' | 'active' | 'paused' | 'archived';

export type RecommendationMode =
  | 'AI'
  | 'RULES'
  | 'MANUAL'
  | 'HYBRID'
  | 'FREQUENTLY_BOUGHT_TOGETHER'
  | 'SAME_CATEGORY';

export type FallbackMode = 'MANUAL' | 'RULES' | 'NONE';

export type DiscountType = 'NONE' | 'PERCENTAGE' | 'FIXED';

export interface Campaign {
  _id?: string;
  name: string;
  description?: string;
  status: CampaignStatus;
  priority: number;
  startAt?: string;
  endAt?: string;
  triggerProductIds?: string[];
  triggerCollectionIds?: string[];
  excludedProductIds?: string[];
  excludedCollectionIds?: string[];
  minOrderSubtotal?: number;
  maxOrderSubtotal?: number;
  currency: string;
  recommendationMode: RecommendationMode;
  maxOffers: number;
  fallbackMode: FallbackMode;
  discountType: DiscountType;
  discountValue: number;
  displayHeading?: string;
  displaySubheading?: string;
  ctaText?: string;
  _createdDate?: string;
  _updatedDate?: string;
}

export interface Offer {
  _id?: string;
  campaignId: string;
  productId: string;
  variantId?: string;
  productName: string;
  productImageUrl?: string;
  regularPrice: number;
  discountType: DiscountType;
  discountValue: number;
  offerPrice: number;
  title: string;
  description?: string;
  badge?: string;
  priority: number;
  active: boolean;
  reason?: string;
}

export type EventType =
  | 'impression'
  | 'click'
  | 'dismiss'
  | 'recommendation_request'
  | 'checkout_started'
  | 'purchase_confirmed';

export interface OfferEvent {
  _id?: string;
  campaignId: string;
  offerId?: string;
  productId: string;
  originalOrderId?: string;
  additionalOrderId?: string;
  eventType: EventType;
  sessionKey: string;
  currency?: string;
  amount?: number;
  aiRecommended?: boolean;
  recommendationReason?: string;
  _createdDate?: string;
}

export interface AppSettings {
  _id?: string;
  siteId?: string;
  aiEnabled: boolean;
  defaultRecommendationMode: RecommendationMode;
  maxRecommendations: number;
  defaultFallbackMode: FallbackMode;
  headline: string;
  subheadline: string;
  accentColor: string;
  buttonColor: string;
  buttonTextColor: string;
  borderRadius: number;
  enableAiExplanations: boolean;
  plan: 'Free' | 'Basic' | 'Pro';
  monthlyAiAllowance: number;
  monthlyAiUsage: number;
}

export interface BillingStatus {
  /** Plan name from Wix billing, or the stored plan when Wix billing is unavailable. */
  plan: string;
  isFree: boolean;
  billingCycle?: string;
  /** ISO date the current paid period ends. */
  expirationDate?: string | null;
  autoRenewing?: boolean | null;
  freeTrial?: { status: 'IN_PROGRESS' | 'ENDED' | 'NOT_AVAILABLE'; endDate?: string | null };
  monthlyUsage: number;
  monthlyAllowance: number;
  /** Wix pricing page for this site's app instance; open in a new tab. */
  upgradeUrl?: string;
  /** False when the Wix app instance couldn't be read and plan details came from app settings. */
  fromWixBilling: boolean;
  entitlements: {
    unlimitedCampaigns: boolean;
    advancedTargeting: boolean;
    smartRanking: boolean;
    analyticsExport: boolean;
  };
}

export interface ProductCandidate {
  productId: string;
  variantId?: string;
  name: string;
  description?: string;
  category?: string;
  price: number;
  currency: string;
  imageUrl?: string;
  inStock: boolean;
}

export interface RecommendationInput {
  currency: string;
  purchasedProducts: {
    productId: string;
    name: string;
    description?: string;
    category?: string;
    price?: number;
  }[];
  candidates: ProductCandidate[];
  maxRecommendations: number;
}

export interface AIRecommendationItem {
  productId: string;
  relevance: 'high' | 'medium' | 'low';
  relationship: string;
  reason: string;
}

export interface RecommendationResult {
  recommendations: AIRecommendationItem[];
  provider: string;
  model: string;
  tokensUsed?: number;
}
