import { extensions } from '@wix/astro/builders';

export default extensions.dashboardPage({
  id: '1383c202-0505-4d5c-bac8-ab6bb58945b8',
  title: 'Smart Post-Purchase Offers',
  routePath: '',
  component: './extensions/dashboard/pages/my-page/my-page.tsx',
  fullPage: false,
  metaData: {
    searchable: true,
    description: 'Manage post-purchase upsell campaigns, smart recommendations, and analytics.',
  },
});
