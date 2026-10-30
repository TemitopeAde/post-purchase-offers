import type { DataCollection } from '@wix/astro/builders';

export const collectionIdSuffix = 'campaigns';

export default {
  idSuffix: collectionIdSuffix,
  displayName: 'Campaigns',
  displayField: 'name',
  fields: [
    { key: 'name', displayName: 'Campaign Name', type: 'TEXT' },
    { key: 'description', displayName: 'Description', type: 'TEXT' },
    { key: 'status', displayName: 'Status', type: 'TEXT' },
    { key: 'priority', displayName: 'Priority', type: 'NUMBER' },
    { key: 'startAt', displayName: 'Start Date', type: 'DATETIME' },
    { key: 'endAt', displayName: 'End Date', type: 'DATETIME' },
    { key: 'triggerProductIds', displayName: 'Trigger Product IDs', type: 'ARRAY_STRING' },
    { key: 'triggerCollectionIds', displayName: 'Trigger Collection IDs', type: 'ARRAY_STRING' },
    { key: 'excludedProductIds', displayName: 'Excluded Product IDs', type: 'ARRAY_STRING' },
    { key: 'excludedCollectionIds', displayName: 'Excluded Collection IDs', type: 'ARRAY_STRING' },
    { key: 'minOrderSubtotal', displayName: 'Min Order Subtotal', type: 'NUMBER' },
    { key: 'maxOrderSubtotal', displayName: 'Max Order Subtotal', type: 'NUMBER' },
    { key: 'currency', displayName: 'Currency', type: 'TEXT' },
    { key: 'recommendationMode', displayName: 'Recommendation Mode', type: 'TEXT' },
    { key: 'maxOffers', displayName: 'Max Offers', type: 'NUMBER' },
    { key: 'fallbackMode', displayName: 'Fallback Mode', type: 'TEXT' },
    { key: 'discountType', displayName: 'Discount Type', type: 'TEXT' },
    { key: 'discountValue', displayName: 'Discount Value', type: 'NUMBER' },
    { key: 'displayHeading', displayName: 'Display Heading', type: 'TEXT' },
    { key: 'displaySubheading', displayName: 'Display Subheading', type: 'TEXT' },
    { key: 'ctaText', displayName: 'Call to Action Text', type: 'TEXT' },
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
