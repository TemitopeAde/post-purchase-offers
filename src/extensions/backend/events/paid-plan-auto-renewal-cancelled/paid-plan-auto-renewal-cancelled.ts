/**
This file contains:

- The relevant import statement for the event.
- An event function where you can implement your custom logic. Wix calls this function when the given event occurs, passing the event object and its metadata.

This file implements an example for the Wix CRM's Contact Created event.
To run this example please add the relevant permission (https://wix.to/APN0tpK) and install the `@wix/crm` dependency
SDK modules and their available events are documented here: https://dev.wix.com/docs/sdk
*/

import { appInstances } from '@wix/app-management';
import { recordLifecycleEvent } from '../../../../backend/record-lifecycle-event';
import { runInBackground } from '../../../../backend/run-in-background';

export default appInstances.onAppInstancePaidPlanAutoRenewalCancelled((event) => {
  runInBackground('PaidPlanAutoRenewalCancelled Sheets record', () => recordLifecycleEvent('PaidPlanAutoRenewalCancelled', event));
});
