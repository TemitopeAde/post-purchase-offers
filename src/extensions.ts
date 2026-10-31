import { app } from '@wix/astro/builders';
import myPage from './extensions/dashboard/pages/my-page/my-page.extension.ts';

import dataCollections from './extensions/backend/data-collections/data-collections.extension.ts';

import postPurchaseOffers from './extensions/site/plugins/post-purchase-offers/post-purchase-offers.extension.ts';

import postPurchaseAi from './extensions/backend/app-tools/post-purchase-ai/post-purchase-ai.extension.ts';

import ppoAiProvider from './extensions/backend/service-plugins/ppo-ai-provider/ppo-ai-provider.extension.ts';

import appInstalled from './extensions/backend/events/app-installed/app-installed.extension.ts';

import appRemoved from './extensions/backend/events/app-removed/app-removed.extension.ts';

import paidPlanPurchased from './extensions/backend/events/paid-plan-purchased/paid-plan-purchased.extension.ts';

import paidPlanChanged from './extensions/backend/events/paid-plan-changed/paid-plan-changed.extension.ts';

import paidPlanAutoRenewalCancelled from './extensions/backend/events/paid-plan-auto-renewal-cancelled/paid-plan-auto-renewal-cancelled.extension.ts';

import planConvertedToPaid from './extensions/backend/events/plan-converted-to-paid/plan-converted-to-paid.extension.ts';

import planReactivated from './extensions/backend/events/plan-reactivated/plan-reactivated.extension.ts';

import planTransferred from './extensions/backend/events/plan-transferred/plan-transferred.extension.ts';

export default app().use(myPage).use(dataCollections).use(postPurchaseOffers).use(postPurchaseAi).use(ppoAiProvider).use(appInstalled).use(appRemoved).use(paidPlanPurchased).use(paidPlanChanged).use(paidPlanAutoRenewalCancelled).use(planConvertedToPaid).use(planReactivated).use(planTransferred);
