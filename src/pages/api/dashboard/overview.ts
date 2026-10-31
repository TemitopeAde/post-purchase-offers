import type { APIRoute } from 'astro';
import { getDashboardOverviewMetrics } from '../../../lib/analytics';
import { getPlanContext } from '../../../lib/wix/billing';

export const GET: APIRoute = async () => {
  try {
    const { limits } = await getPlanContext();
    // Without a plan, show the shortest history (Pro's).
    const metrics = await getDashboardOverviewMetrics(limits ? limits.analyticsDays : 90);
    return Response.json(metrics, {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return Response.json(
      { error: err?.message || 'Failed to fetch overview metrics' },
      { status: 500 }
    );
  }
};
