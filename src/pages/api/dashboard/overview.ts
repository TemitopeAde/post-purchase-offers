import type { APIRoute } from 'astro';
import { getDashboardOverviewMetrics } from '../../../lib/analytics';

export const GET: APIRoute = async () => {
  try {
    const metrics = await getDashboardOverviewMetrics();
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
