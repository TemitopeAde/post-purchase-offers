import type { DataCollection } from '@wix/astro/builders';

export const collectionIdSuffix = 'offers';

export default {
  idSuffix: collectionIdSuffix,
  displayName: 'Offers',
  displayField: 'title',
  fields: [
    { key: 'campaignId', displayName: 'Campaign ID', type: 'TEXT' },
    { key: 'productId', displayName: 'Product ID', type: 'TEXT' },
    { key: 'variantId', displayName: 'Variant ID', type: 'TEXT' },
    { key: 'productName', displayName: 'Product Name', type: 'TEXT' },
    { key: 'productImageUrl', displayName: 'Product Image URL', type: 'TEXT' },
    { key: 'regularPrice', displayName: 'Regular Price', type: 'NUMBER' },
    { key: 'discountType', displayName: 'Discount Type', type: 'TEXT' },
    { key: 'discountValue', displayName: 'Discount Value', type: 'NUMBER' },
    { key: 'offerPrice', displayName: 'Offer Price', type: 'NUMBER' },
    { key: 'title', displayName: 'Offer Title', type: 'TEXT' },
    { key: 'description', displayName: 'Offer Description', type: 'TEXT' },
    { key: 'badge', displayName: 'Badge Label', type: 'TEXT' },
    { key: 'priority', displayName: 'Priority', type: 'NUMBER' },
    { key: 'active', displayName: 'Is Active', type: 'BOOLEAN' },
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
