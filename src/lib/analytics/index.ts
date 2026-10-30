import { getOfferEvents, getCampaigns } from '../wix/data';

export interface DashboardOverviewMetrics {
  totalAttributedRevenue: number;
  totalImpressions: number;
  totalClicks: number;
  totalCheckoutsStarted: number;
  totalPurchases: number;
  ctr: number; // in percent
  conversionRate: number; // in percent
  averageOrderValue: number;
  activeCampaignsCount: number;
  aiAcceptanceRate: number;
  campaignPerformance: {
    campaignId: string;
    campaignName: string;
    impressions: number;
    clicks: number;
    purchases: number;
    revenue: number;
    conversionRate: number;
  }[];
  recentActivity: {
    id: string;
    eventType: string;
    productId: string;
    amount?: number;
    timestamp: string;
  }[];
}

export async function getDashboardOverviewMetrics(): Promise<DashboardOverviewMetrics> {
  const [events, campaigns] = await Promise.all([getOfferEvents(), getCampaigns()]);

  const activeCampaigns = campaigns.filter((c) => c.status === 'active');

  let totalImpressions = 0;
  let totalClicks = 0;
  let totalCheckoutsStarted = 0;
  let totalPurchases = 0;
  let totalAttributedRevenue = 0;
  let aiImpressions = 0;
  let aiClicks = 0;

  const campaignStats = new Map<
    string,
    { impressions: number; clicks: number; purchases: number; revenue: number }
  >();

  for (const c of campaigns) {
    if (c._id) {
      campaignStats.set(c._id, { impressions: 0, clicks: 0, purchases: 0, revenue: 0 });
    }
  }

  for (const evt of events) {
    const stats = evt.campaignId ? campaignStats.get(evt.campaignId) : undefined;

    if (evt.eventType === 'impression') {
      totalImpressions++;
      if (stats) stats.impressions++;
      if (evt.aiRecommended) aiImpressions++;
    } else if (evt.eventType === 'click') {
      totalClicks++;
      if (stats) stats.clicks++;
      if (evt.aiRecommended) aiClicks++;
    } else if (evt.eventType === 'checkout_started') {
      totalCheckoutsStarted++;
    } else if (evt.eventType === 'purchase_confirmed') {
      totalPurchases++;
      const rev = Number(evt.amount || 0);
      totalAttributedRevenue += rev;
      if (stats) {
        stats.purchases++;
        stats.revenue += rev;
      }
    }
  }

  const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const conversionRate = totalImpressions > 0 ? (totalPurchases / totalImpressions) * 100 : 0;
  const averageOrderValue = totalPurchases > 0 ? totalAttributedRevenue / totalPurchases : 0;
  const aiAcceptanceRate = aiImpressions > 0 ? (aiClicks / aiImpressions) * 100 : 0;

  const campaignPerformance = campaigns.map((c) => {
    const stats = (c._id && campaignStats.get(c._id)) || {
      impressions: 0,
      clicks: 0,
      purchases: 0,
      revenue: 0,
    };
    const cConv = stats.impressions > 0 ? (stats.purchases / stats.impressions) * 100 : 0;
    return {
      campaignId: c._id || '',
      campaignName: c.name,
      impressions: stats.impressions,
      clicks: stats.clicks,
      purchases: stats.purchases,
      revenue: stats.revenue,
      conversionRate: Math.round(cConv * 10) / 10,
    };
  });

  const recentActivity = events
    .slice(-10)
    .reverse()
    .map((e) => ({
      id: e._id || '',
      eventType: e.eventType,
      productId: e.productId,
      amount: e.amount,
      timestamp: e._createdDate || new Date().toISOString(),
    }));

  return {
    totalAttributedRevenue: Math.round(totalAttributedRevenue * 100) / 100,
    totalImpressions,
    totalClicks,
    totalCheckoutsStarted,
    totalPurchases,
    ctr: Math.round(ctr * 10) / 10,
    conversionRate: Math.round(conversionRate * 10) / 10,
    averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    activeCampaignsCount: activeCampaigns.length,
    aiAcceptanceRate: Math.round(aiAcceptanceRate * 10) / 10,
    campaignPerformance,
    recentActivity,
  };
}
