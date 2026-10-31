import { appInstances } from '@wix/app-management';
import { auth } from '@wix/essentials';
import { PLANS, planFromPackageName, type PlanId, type PlanLimits } from '../billing/plans';
import { getAppSettings, getCampaigns } from './data';

export interface PlanContext {
  /** Null when the site has no paid plan and no free trial in progress. */
  plan: PlanId | null;
  limits: PlanLimits | null;
  instance?: appInstances.AppInstance;
  /** False when the Wix app instance couldn't be read and the plan came from app settings. */
  fromWixBilling: boolean;
  /** True when plan restrictions are intentionally bypassed for local/development testing. */
  isDevelopment: boolean;
}

export const isDevelopmentEnvironment = () => {
  const environment = import.meta.env.ENVIRONMENT ?? process.env.ENVIRONMENT;
  return environment?.toLowerCase() === 'development';
};

const DEVELOPMENT_LIMITS: PlanLimits = {
  ...PLANS.Business.limits,
  monthlyAiRecommendations: Number.MAX_SAFE_INTEGER,
};

export async function getPlanContext(): Promise<PlanContext> {
  let instance: appInstances.AppInstance | undefined;
  try {
    const getAppInstance = auth.elevate(appInstances.getAppInstance);
    instance = (await getAppInstance()).instance;
  } catch (err) {
    console.error('Get App Instance failed; using stored plan:', err);
  }

  let plan: PlanId | null;
  if (instance) {
    // Wix can return a paid package without a reliable `isFree` value in every
    // app-instance response. A package name or active trial is sufficient to
    // identify an entitled installation.
    const inTrial = instance.billing?.freeTrialInfo?.status === 'IN_PROGRESS';
    const packageName = instance.billing?.packageName;
    plan = packageName || instance.isFree === false || inTrial
      ? planFromPackageName(packageName)
      : null;
    console.info('[Post-Purchase Offers] Billing resolved', {
      hasPackageName: Boolean(packageName),
      isFree: instance.isFree ?? null,
      trialStatus: instance.billing?.freeTrialInfo?.status ?? null,
      plan,
    });
  } else {
    const stored = (await getAppSettings()).plan;
    plan = stored in PLANS ? stored : null;
  }

  const isDevelopment = isDevelopmentEnvironment();
  return {
    plan,
    limits: isDevelopment ? DEVELOPMENT_LIMITS : plan ? PLANS[plan].limits : null,
    instance,
    fromWixBilling: Boolean(instance),
    isDevelopment,
  };
}

/** Returns an error message when activating another campaign would exceed the plan, otherwise null. */
export async function checkCampaignActivation(campaignId?: string): Promise<string | null> {
  const { plan, limits, isDevelopment } = await getPlanContext();
  if (!isDevelopment && (!plan || !limits)) return 'Choose a plan to activate campaigns.';
  if (!limits) return 'Choose a plan to activate campaigns.';
  if (limits.maxActiveCampaigns === null) return null;

  const active = (await getCampaigns()).filter((c) => c.status === 'active' && c._id !== campaignId);
  return active.length >= limits.maxActiveCampaigns
    ? `The ${plan} plan allows ${limits.maxActiveCampaigns} active campaigns. Pause one or upgrade to Business.`
    : null;
}
