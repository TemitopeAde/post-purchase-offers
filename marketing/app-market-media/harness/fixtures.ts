// Sample store data used to render the real app UI for App Market screenshots.

// Wide crops so photos fill the widget's 160px-tall image area.
const img = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=720&h=280&q=80`;

export const IMAGES = {
  headphones: img('1505740420928-5e560c06d30e'),
  earbudsCases: img('1590658268037-6bf12165a8df'),
  charger: img('1583863788434-e58a36330cf0'),
  overEar: img('1546435770-a3e426bf472b'),
};

export const overview = {
  totalAttributedRevenue: 9846.2,
  totalImpressions: 12840,
  totalClicks: 1104,
  totalCheckoutsStarted: 512,
  totalPurchases: 398,
  ctr: 8.6,
  conversionRate: 3.1,
  averageOrderValue: 24.74,
  activeCampaignsCount: 2,
  aiAcceptanceRate: 36.1,
  campaignPerformance: [
    { campaignId: 'c1', campaignName: 'Audio Accessories Bundle', impressions: 6120, clicks: 562, purchases: 214, revenue: 5312.4, conversionRate: 3.5 },
    { campaignId: 'c2', campaignName: 'Phone Case Cross-Sell', impressions: 4380, clicks: 371, purchases: 126, revenue: 3104.8, conversionRate: 2.9 },
    { campaignId: 'c3', campaignName: 'Summer Essentials', impressions: 2340, clicks: 171, purchases: 58, revenue: 1429.0, conversionRate: 2.5 },
  ],
  recentActivity: [],
};

const campaign = (c: Record<string, unknown>) => ({
  priority: 5,
  currency: 'USD',
  maxOffers: 2,
  fallbackMode: 'RULES',
  discountType: 'PERCENTAGE',
  ...c,
});

export const campaigns = [
  campaign({ _id: 'c1', name: 'Audio Accessories Bundle', description: 'Chargers and cases for headphone orders', status: 'active', recommendationMode: 'AI', discountValue: 15, minOrderSubtotal: 50 }),
  campaign({ _id: 'c2', name: 'Phone Case Cross-Sell', description: 'Protection for every new phone', status: 'active', recommendationMode: 'HYBRID', discountValue: 10, minOrderSubtotal: 0 }),
  campaign({ _id: 'c3', name: 'Summer Essentials', status: 'paused', recommendationMode: 'RULES', discountValue: 20, minOrderSubtotal: 75 }),
  campaign({ _id: 'c4', name: 'VIP Add-ons', status: 'paused', recommendationMode: 'MANUAL', discountType: 'FIXED', discountValue: 5, minOrderSubtotal: 120 }),
];

export const settings = {
  aiEnabled: true,
  defaultRecommendationMode: 'AI',
  maxRecommendations: 2,
  defaultFallbackMode: 'RULES',
  headline: 'A little something extra for you',
  subheadline: 'Complementary picks tailored to your order.',
  accentColor: '#116dff',
  buttonColor: '#116dff',
  buttonTextColor: '#ffffff',
  borderRadius: 8,
  enableAiExplanations: true,
  plan: 'Pro',
  monthlyAiAllowance: 500,
  monthlyAiUsage: 212,
};

export const billing = {
  plan: 'Pro',
  monthlyAllowance: 500,
  monthlyUsage: 212,
};

export const recommendations = {
  campaign: {
    id: 'c1',
    name: 'Audio Accessories Bundle',
    heading: 'A little something extra for you',
    subheading: 'Complementary picks tailored to your recent order.',
    ctaText: 'Claim Offer',
  },
  offers: [
    {
      _id: 'o1',
      productId: 'p1',
      productName: 'Wireless Earbuds Travel Case',
      productImageUrl: IMAGES.earbudsCases,
      regularPrice: 24.99,
      offerPrice: 21.24,
      reason: 'Keeps your new audio gear protected on the go.',
    },
    {
      _id: 'o2',
      productId: 'p2',
      productName: 'Fast Charger & Braided Cable',
      productImageUrl: IMAGES.charger,
      regularPrice: 29.99,
      offerPrice: 25.49,
      reason: 'Charges your new headphones in under an hour.',
    },
  ],
  source: 'ai',
};
