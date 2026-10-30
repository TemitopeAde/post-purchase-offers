import type { APIRoute } from 'astro';
import { getAppSettings } from '../../lib/wix/data';

export const GET: APIRoute = async () => {
  try {
    const settings = await getAppSettings();
    return Response.json({
      plan: settings.plan,
      status: 'ACTIVE',
      monthlyAllowance: settings.monthlyAiAllowance,
      monthlyUsage: settings.monthlyAiUsage,
      entitlements: {
        unlimitedCampaigns: settings.plan === 'Pro',
        advancedTargeting: settings.plan === 'Pro',
        smartRanking: true,
        analyticsExport: settings.plan !== 'Free',
      },
    }, { status: 200 });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Failed to fetch billing status' }, { status: 500 });
  }
};
