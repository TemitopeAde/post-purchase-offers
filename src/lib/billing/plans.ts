export type PlanId = 'Pro' | 'Business';

export interface PlanLimits {
  /** Campaigns that can be active at the same time; null means unlimited. */
  maxActiveCampaigns: number | null;
  monthlyAiRecommendations: number;
  /** Days of analytics history shown; null means all history. */
  analyticsDays: number | null;
  aiExplanations: boolean;
  advancedTargeting: boolean;
  stackedRules: boolean;
  prioritySupport: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  monthlyPrice: number;
  /** Per-month price when billed yearly. */
  yearlyMonthlyPrice: number;
  trialDays: number;
  limits: PlanLimits;
}

// Prices and trials are configured on the app's pricing page in the Wix Dev Center; keep them in sync.
export const PLANS: Record<PlanId, PlanDefinition> = {
  Pro: {
    id: 'Pro',
    monthlyPrice: 6.5,
    yearlyMonthlyPrice: 6,
    trialDays: 3,
    limits: {
      maxActiveCampaigns: 10,
      monthlyAiRecommendations: 2000,
      analyticsDays: 90,
      aiExplanations: true,
      advancedTargeting: true,
      stackedRules: false,
      prioritySupport: false,
    },
  },
  Business: {
    id: 'Business',
    monthlyPrice: 12,
    yearlyMonthlyPrice: 10,
    trialDays: 3,
    limits: {
      maxActiveCampaigns: null,
      monthlyAiRecommendations: 5000,
      analyticsDays: null,
      aiExplanations: true,
      advancedTargeting: true,
      stackedRules: true,
      prioritySupport: true,
    },
  },
};

/** Maps a Wix billing package name (e.g. "business", "pro-yearly") to a plan. Unknown paid packages get Pro. */
export function planFromPackageName(packageName?: string | null): PlanId {
  return packageName?.toLowerCase().includes('business') ? 'Business' : 'Pro';
}
