import type { DataCollection } from '@wix/astro/builders';

export const collectionIdSuffix = 'offer-events';

export default {
  idSuffix: collectionIdSuffix,
  displayName: 'Offer Events',
  displayField: 'eventType',
  fields: [
    { key: 'campaignId', displayName: 'Campaign ID', type: 'TEXT' },
    { key: 'offerId', displayName: 'Offer ID', type: 'TEXT' },
    { key: 'productId', displayName: 'Product ID', type: 'TEXT' },
    { key: 'originalOrderId', displayName: 'Original Order ID', type: 'TEXT' },
    { key: 'additionalOrderId', displayName: 'Additional Order ID', type: 'TEXT' },
    { key: 'eventType', displayName: 'Event Type', type: 'TEXT' },
    { key: 'sessionKey', displayName: 'Session Key', type: 'TEXT' },
    { key: 'currency', displayName: 'Currency', type: 'TEXT' },
    { key: 'amount', displayName: 'Amount', type: 'NUMBER' },
    { key: 'aiRecommended', displayName: 'AI Recommended', type: 'BOOLEAN' },
    { key: 'recommendationReason', displayName: 'Recommendation Reason', type: 'TEXT' },
  ],
  dataPermissions: {
    itemInsert: 'ANYONE',
    itemRead: 'CMS_EDITOR',
    itemRemove: 'CMS_EDITOR',
    itemUpdate: 'CMS_EDITOR',
  },
  indexes: [],
  initialData: [],
} satisfies DataCollection;
