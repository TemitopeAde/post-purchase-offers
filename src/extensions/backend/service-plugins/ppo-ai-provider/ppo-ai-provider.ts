import { toolsProvider } from '@wix/app-tools/service-plugins';
import { getDashboardOverviewMetrics } from '../../../../lib/analytics';
import { getCampaigns, getAppSettings, updateAppSettings } from '../../../../lib/wix/data';
import type { AppSettings } from '../../../../lib/types';

type ToolPayload = Record<string, unknown>;

const getPayload = (payload: unknown): ToolPayload =>
  payload && typeof payload === 'object' ? (payload as ToolPayload) : {};

const optionalString = (payload: ToolPayload, key: string) => {
  const value = payload[key];
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.length > 500) {
    throw new Error(`${key} must be a string with no more than 500 characters`);
  }
  return value;
};

const optionalBoolean = (payload: ToolPayload, key: string) => {
  const value = payload[key];
  if (value === undefined) return undefined;
  if (typeof value !== 'boolean') throw new Error(`${key} must be a boolean`);
  return value;
};

const optionalNumber = (payload: ToolPayload, key: string) => {
  const value = payload[key];
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 48) {
    throw new Error(`${key} must be a number from 0 to 48`);
  }
  return value;
};

toolsProvider.provideHandlers({
  runTool: async ({ request }) => {
    const payload = getPayload(request.payload);

    switch (request.methodName) {
      case 'get-store-performance': {
        const metrics = await getDashboardOverviewMetrics(90);
        return {
          response: {
            totalImpressions: metrics.totalImpressions,
            totalClicks: metrics.totalClicks,
            totalPurchases: metrics.totalPurchases,
            totalAttributedRevenue: metrics.totalAttributedRevenue,
            conversionRate: metrics.conversionRate,
            activeCampaignsCount: metrics.activeCampaignsCount,
          },
        };
      }

      case 'list-offer-campaigns': {
        const campaigns = await getCampaigns();
        return {
          response: {
            campaigns: campaigns.map((campaign) => ({
              id: campaign._id,
              name: campaign.name,
              status: campaign.status,
              recommendationMode: campaign.recommendationMode,
              discountType: campaign.discountType,
              discountValue: campaign.discountValue,
              minOrderSubtotal: campaign.minOrderSubtotal,
              maxOffers: campaign.maxOffers,
            })),
          },
        };
      }

      case 'update-offer-settings': {
        const updates: Partial<AppSettings> = {
          aiEnabled: optionalBoolean(payload, 'aiEnabled'),
          enableAiExplanations: optionalBoolean(payload, 'enableAiExplanations'),
          headline: optionalString(payload, 'headline'),
          subheadline: optionalString(payload, 'subheadline'),
          buttonColor: optionalString(payload, 'buttonColor'),
          buttonTextColor: optionalString(payload, 'buttonTextColor'),
          borderRadius: optionalNumber(payload, 'borderRadius'),
        };

        const definedUpdates = Object.fromEntries(
          Object.entries(updates).filter(([, value]) => value !== undefined),
        ) as Partial<AppSettings>;

        if (Object.keys(definedUpdates).length === 0) {
          throw new Error('At least one setting must be provided');
        }

        const settings = await updateAppSettings(definedUpdates);
        return {
          response: {
            updated: true,
            settings: {
              aiEnabled: settings.aiEnabled,
              enableAiExplanations: settings.enableAiExplanations,
              headline: settings.headline,
              subheadline: settings.subheadline,
              buttonColor: settings.buttonColor,
              buttonTextColor: settings.buttonTextColor,
              borderRadius: settings.borderRadius,
            },
          },
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.methodName}`);
    }
  },
});
