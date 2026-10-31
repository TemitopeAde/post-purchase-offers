import type { APIRoute } from 'astro';
import { appInstances } from '@wix/app-management';
import { getAppSettings, getMonthlyAiUsage } from '../../lib/wix/data';
import type { BillingStatus } from '../../lib/types';
import wixConfig from '../../../wix.config.json';

// https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/set-up-a-wix-pricing-page
const upgradeUrl = (instanceId: string) =>
  `https://www.wix.com/apps/upgrade/${wixConfig.appId}?appInstanceId=${encodeURIComponent(instanceId)}`;

export const GET: APIRoute = async () => {
  try {
    const [settings, monthlyUsage] = await Promise.all([getAppSettings(), getMonthlyAiUsage()]);

    // Wix billing is the source of truth for the plan; fall back to stored settings if it can't be read.
    let instance: appInstances.AppInstance | undefined;
    try {
      instance = (await appInstances.getAppInstance()).instance;
    } catch (err) {
      console.error('Get App Instance failed; using stored plan:', err);
    }

    const billing = instance?.billing;
    const isFree = instance ? instance.isFree !== false : settings.plan === 'Free';
    const paid = !isFree;

    const status: BillingStatus = {
      plan: instance ? (paid ? billing?.packageName || 'Premium' : 'Free') : settings.plan,
      isFree,
      billingCycle: billing?.billingCycle,
      expirationDate: billing?.expirationDate ?? null,
      autoRenewing: billing?.autoRenewing ?? null,
      freeTrial: billing?.freeTrialInfo?.status
        ? {
            status: billing.freeTrialInfo.status as NonNullable<BillingStatus['freeTrial']>['status'],
            endDate: billing.freeTrialInfo.endDate ? new Date(billing.freeTrialInfo.endDate).toISOString() : null,
          }
        : undefined,
      monthlyUsage,
      monthlyAllowance: settings.monthlyAiAllowance,
      upgradeUrl: instance?.instanceId ? upgradeUrl(instance.instanceId) : undefined,
      fromWixBilling: Boolean(instance),
      entitlements: {
        unlimitedCampaigns: paid,
        advancedTargeting: paid,
        smartRanking: true,
        analyticsExport: paid,
      },
    };

    return Response.json(status, { status: 200 });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Failed to fetch billing status' }, { status: 500 });
  }
};
