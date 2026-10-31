import type { APIRoute } from 'astro';
import { getCampaigns, getMonthlyAiUsage } from '../../lib/wix/data';
import { getPlanContext } from '../../lib/wix/billing';
import type { BillingStatus } from '../../lib/types';
import wixConfig from '../../../wix.config.json';

// https://dev.wix.com/docs/build-apps/launch-your-app/pricing-and-billing/set-up-a-wix-pricing-page
const upgradeUrl = (instanceId: string) =>
  `https://www.wix.com/apps/upgrade/${wixConfig.appId}?appInstanceId=${encodeURIComponent(instanceId)}`;

export const GET: APIRoute = async () => {
  try {
    const [{ plan, limits, instance, fromWixBilling, isDevelopment }, monthlyUsage, campaigns] = await Promise.all([
      getPlanContext(),
      getMonthlyAiUsage(),
      getCampaigns(),
    ]);
    const billing = instance?.billing;

    const status: BillingStatus = {
      plan,
      limits,
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
      activeCampaigns: campaigns.filter((c) => c.status === 'active').length,
      upgradeUrl: instance?.instanceId ? upgradeUrl(instance.instanceId) : undefined,
      fromWixBilling,
      isDevelopment,
    };

    return Response.json(status, { status: 200 });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Failed to fetch billing status' }, { status: 500 });
  }
};
