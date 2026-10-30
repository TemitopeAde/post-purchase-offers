import type { DataCollection } from '@wix/astro/builders';

export const collectionIdSuffix = 'app-settings';

export default {
  idSuffix: collectionIdSuffix,
  displayName: 'App Settings',
  displayField: 'siteId',
  fields: [
    { key: 'siteId', displayName: 'Site ID', type: 'TEXT' },
    { key: 'aiEnabled', displayName: 'AI Recommendations Enabled', type: 'BOOLEAN' },
    { key: 'defaultRecommendationMode', displayName: 'Default Recommendation Mode', type: 'TEXT' },
    { key: 'maxRecommendations', displayName: 'Max Recommendations', type: 'NUMBER' },
    { key: 'defaultFallbackMode', displayName: 'Default Fallback Mode', type: 'TEXT' },
    { key: 'headline', displayName: 'Storefront Headline', type: 'TEXT' },
    { key: 'subheadline', displayName: 'Storefront Subheadline', type: 'TEXT' },
    { key: 'accentColor', displayName: 'Accent Color', type: 'TEXT' },
    { key: 'buttonColor', displayName: 'Button Color', type: 'TEXT' },
    { key: 'buttonTextColor', displayName: 'Button Text Color', type: 'TEXT' },
    { key: 'borderRadius', displayName: 'Border Radius', type: 'NUMBER' },
    { key: 'enableAiExplanations', displayName: 'Enable AI Explanations', type: 'BOOLEAN' },
    { key: 'plan', displayName: 'Subscription Plan', type: 'TEXT' },
    { key: 'monthlyAiAllowance', displayName: 'Monthly AI Allowance', type: 'NUMBER' },
    { key: 'monthlyAiUsage', displayName: 'Monthly AI Usage', type: 'NUMBER' },
  ],
  dataPermissions: {
    itemInsert: 'CMS_EDITOR',
    itemRead: 'ANYONE',
    itemRemove: 'CMS_EDITOR',
    itemUpdate: 'CMS_EDITOR',
  },
  indexes: [],
  initialData: [],
} satisfies DataCollection;
