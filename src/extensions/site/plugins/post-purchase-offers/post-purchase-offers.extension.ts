import { extensions } from '@wix/astro/builders';

export default extensions.sitePlugin({
  id: 'd0e801b8-b18c-487f-82bb-25c64e2f1a62',
  name: 'post-purchase-offers',
  marketData: {
    name: 'Smart Post-Purchase Offers',
    description: 'Smart post-purchase upsell and cross-sell offers to boost average order value.',
    logoUrl: '{{BASE_URL}}/post-purchase-offers-logo.png',
  },
  placements: [
    {
      appDefinitionId: '1380b703-ce81-ff05-f115-39571d94dfcd',
      widgetId: '1380bbb4-8df0-fd38-a235-88821cf3f8a4',
      slotId: 'thank-you-page:items:after',
    },
  ],
  installation: { autoAdd: true },
  tagName: 'post-purchase-offers',
  element: './extensions/site/plugins/post-purchase-offers/post-purchase-offers.tsx',
  settings: './extensions/site/plugins/post-purchase-offers/post-purchase-offers.panel.tsx',
});
