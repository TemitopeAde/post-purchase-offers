/**
This file contains:

- The relevant import statement for the event.
- An event function where you can implement your custom logic. Wix calls this function when the given event occurs, passing the event object and its metadata.

This file implements an example for the Wix CRM's Contact Created event.
To run this example please add the relevant permission (https://wix.to/APN0tpK) and install the `@wix/crm` dependency
SDK modules and their available events are documented here: https://dev.wix.com/docs/sdk
*/

import { appInstances } from '@wix/app-management';
import { notifyLifecycleEvent } from '../../../../backend/notify-lifecycle-event';
import { recordLifecycleEvent } from '../../../../backend/record-lifecycle-event';
import { runInBackground } from '../../../../backend/run-in-background';

export default appInstances.onAppInstancePaidPlanChanged((event) => {
  runInBackground('PaidPlanChanged email', () => notifyLifecycleEvent({
    eventType: 'PAID_PLAN_CHANGED',
    vendorProductId: event.data.vendorProductId,
    previousVendorProductId: event.data.previousVendorProductId,
    cycle: event.data.cycle,
    invoiceId: event.data.invoiceId,
    occurredAt: event.data.operationTimeStamp,
    instanceIdHint: event.metadata?.instanceId,
  }));
  runInBackground('PaidPlanChanged Sheets record', () => recordLifecycleEvent('PaidPlanChanged', event));
});
