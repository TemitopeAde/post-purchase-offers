import { catalogVersioning, products, productsV3 } from '@wix/stores';
import type { ProductCandidate } from '../types';

export type CatalogVersion = 'V1_CATALOG' | 'V3_CATALOG' | 'STORES_NOT_INSTALLED';

let cachedVersion: CatalogVersion | undefined;

export async function getStoreCatalogVersion(): Promise<CatalogVersion> {
  if (cachedVersion) return cachedVersion;
  try {
    const res = await catalogVersioning.getCatalogVersion();
    cachedVersion = (res.catalogVersion as CatalogVersion) || 'V1_CATALOG';
    return cachedVersion;
  } catch (err) {
    console.warn('Could not determine catalog version:', err);
    return 'V1_CATALOG';
  }
}

export function toBrowserImageUrl(mediaRef?: any): string | undefined {
  if (!mediaRef) return undefined;
  if (typeof mediaRef === 'string') {
    if (mediaRef.startsWith('wix:image://v1/')) {
      const parts = mediaRef.replace('wix:image://v1/', '').split('/');
      const uri = parts[0];
      return `https://static.wixstatic.com/media/${uri}`;
    }
    return mediaRef;
  }
  if (mediaRef.url) return mediaRef.url;
  return undefined;
}

export async function getProductCandidates(options: {
  excludeProductIds?: string[];
  maxLimit?: number;
}): Promise<ProductCandidate[]> {
  const version = await getStoreCatalogVersion();
  const limit = Math.min(options.maxLimit || 30, 50);
  const excludeSet = new Set(options.excludeProductIds || []);

  const candidates: ProductCandidate[] = [];

  try {
    if (version === 'V3_CATALOG') {
      const response = await productsV3
        .queryProducts({
          fields: ['CURRENCY', 'THUMBNAIL', 'URL'],
        })
        .limit(limit)
        .find();

      for (const item of response.items || []) {
        if (!item._id || excludeSet.has(item._id)) continue;

        const main = item.media?.main;
        const imageUrl =
          toBrowserImageUrl(main?.image) ||
          toBrowserImageUrl(main?.thumbnail?.url) ||
          toBrowserImageUrl(main?.url);

        const primaryVariant = item.variantsInfo?.variants?.[0];
        const priceAmount = Number(primaryVariant?.price?.actualPrice?.amount || 0);
        const desc = typeof item.description === 'string' ? item.description : '';

        candidates.push({
          productId: item._id,
          name: item.name || 'Store Product',
          description: desc,
          category: item.directCategoriesInfo?.categories?.[0]?._id,
          price: priceAmount,
          currency: item.currency || 'USD',
          imageUrl,
          inStock: item.inventory?.availabilityStatus !== 'OUT_OF_STOCK',
        });
      }
    } else {
      // V1 Catalog
      const response = await products.queryProducts().limit(limit).find();

      for (const item of response.items || []) {
        if (!item._id || excludeSet.has(item._id)) continue;

        const imageUrl = toBrowserImageUrl(item.media?.mainMedia?.image?.url);
        const price = Number(item.priceData?.discountedPrice || item.priceData?.price || 0);

        candidates.push({
          productId: item._id,
          name: item.name || 'Store Product',
          description: typeof item.description === 'string' ? item.description : '',
          category: item.collectionIds?.[0],
          price,
          currency: item.priceData?.currency || 'USD',
          imageUrl,
          inStock: item.stock?.inventoryStatus !== 'OUT_OF_STOCK',
        });
      }
    }
  } catch (err) {
    console.warn('Error querying products from Wix Stores:', err);
  }

  return candidates;
}

export async function getProductDetails(productId: string): Promise<ProductCandidate | null> {
  const version = await getStoreCatalogVersion();
  try {
    if (version === 'V3_CATALOG') {
      const product = await productsV3.getProduct(productId, {
        fields: ['CURRENCY', 'THUMBNAIL', 'URL'],
      });
      if (!product || !product._id) return null;

      const main = product.media?.main;
      const imageUrl =
        toBrowserImageUrl(main?.image) ||
        toBrowserImageUrl(main?.thumbnail?.url) ||
        toBrowserImageUrl(main?.url);

      const primaryVariant = product.variantsInfo?.variants?.[0];
      const priceAmount = Number(primaryVariant?.price?.actualPrice?.amount || 0);
      const desc = typeof product.description === 'string' ? product.description : '';

      return {
        productId: product._id,
        name: product.name || 'Product',
        description: desc,
        category: product.directCategoriesInfo?.categories?.[0]?._id,
        price: priceAmount,
        currency: product.currency || 'USD',
        imageUrl,
        inStock: product.inventory?.availabilityStatus !== 'OUT_OF_STOCK',
      };
    } else {
      const res = await products.getProduct(productId);
      const product = res?.product;
      if (!product || !product._id) return null;

      const imageUrl = toBrowserImageUrl(product.media?.mainMedia?.image?.url);
      const price = Number(product.priceData?.discountedPrice || product.priceData?.price || 0);

      return {
        productId: product._id,
        name: product.name || 'Product',
        description: typeof product.description === 'string' ? product.description : '',
        category: product.collectionIds?.[0],
        price,
        currency: product.priceData?.currency || 'USD',
        imageUrl,
        inStock: product.stock?.inventoryStatus !== 'OUT_OF_STOCK',
      };
    }
  } catch (err) {
    console.warn(`Error getting product details for ${productId}:`, err);
    return null;
  }
}
