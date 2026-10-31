import { catalogVersioning, products, productsV3 } from '@wix/stores';
import type { ProductCandidate } from '../types';

export type CatalogVersion = 'V1_CATALOG' | 'V3_CATALOG' | 'STORES_NOT_INSTALLED';

export interface ProductSearchPage {
  products: ProductCandidate[];
  nextCursor?: string;
  hasNext: boolean;
}

export interface ProductVariantChoice {
  variantId: string;
  choices: Record<string, string>;
  price: number;
  currency: string;
  inStock: boolean;
}

export interface ProductVariantOptions {
  name: string;
  choices: string[];
}

export interface ProductVariantsResult {
  options: ProductVariantOptions[];
  variants: ProductVariantChoice[];
}

let cachedVersion: CatalogVersion | undefined;

function getVariantId(variant: unknown): string | undefined {
  if (!variant || typeof variant !== 'object') return undefined;

  const value = variant as Record<string, unknown>;
  const sdkId = value._id;
  if (typeof sdkId === 'string' && sdkId) return sdkId;

  const runtimeId = value.id;
  return typeof runtimeId === 'string' && runtimeId ? runtimeId : undefined;
}

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

      // Query Products does not return variant data. Resolve each product with
      // Get Product so recommendations carry the authoritative price and
      // variant ID required by Catalog V3 checkout.
      const productIds = (response.items || [])
        .map((item) => item._id)
        .filter((productId): productId is string => Boolean(productId && !excludeSet.has(productId)));

      const productDetails = await Promise.all(productIds.map((productId) => getProductDetails(productId)));
      for (const product of productDetails) {
        if (product && product.price > 0) candidates.push(product);
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

/**
 * Search a bounded page of products for dashboard pickers. The dashboard must
 * never load the entire catalog: a store can contain thousands of products.
 */
export async function searchProductCandidates(options: {
  query?: string;
  cursor?: string;
  limit?: number;
}): Promise<ProductSearchPage> {
  const version = await getStoreCatalogVersion();
  const limit = Math.min(Math.max(options.limit || 20, 1), 50);
  const query = options.query?.trim() || '';

  try {
    if (version === 'V3_CATALOG') {
      const response = await productsV3.searchProducts(
        {
          ...(query
            ? { search: { expression: query, fields: ['name', 'description'] } }
            : {}),
          cursorPaging: {
            limit,
            ...(options.cursor ? { cursor: options.cursor } : {}),
          },
        },
        { fields: ['CURRENCY', 'THUMBNAIL', 'URL'] },
      );

      const productIds = (response.products || [])
        .map((item) => item._id)
        .filter((productId): productId is string => Boolean(productId));
      const products = (await Promise.all(productIds.map((productId) => getProductDetails(productId))))
        .filter((product): product is ProductCandidate => Boolean(product && product.price > 0));

      return {
        products,
        nextCursor: response.pagingMetadata?.cursors?.next ?? undefined,
        hasNext: Boolean(response.pagingMetadata?.hasNext),
      };
    }

    // V1 uses offset paging. Keep the offset opaque to the client so the API
    // has one cursor-shaped contract for both catalog versions.
    const offset = Number(options.cursor || 0) || 0;
    let request = products.queryProducts();
    // The legacy V1 builder supports `contains`, but some installed SDK
    // typings expose only the common builder methods.
    if (query) request = (request as any).contains('name', query);
    const response = await request.skip(offset).limit(limit).find();
    const items = response.items || [];
    const productResults = items
      .filter((item) => Boolean(item._id))
      .map((item) => ({
        productId: item._id as string,
        name: item.name || 'Store Product',
        description: typeof item.description === 'string' ? item.description : '',
        category: item.collectionIds?.[0],
        price: Number(item.priceData?.discountedPrice || item.priceData?.price || 0),
        currency: item.priceData?.currency || 'USD',
        imageUrl: toBrowserImageUrl(item.media?.mainMedia?.image?.url),
        inStock: item.stock?.inventoryStatus !== 'OUT_OF_STOCK',
      }))
      .filter((product) => product.price > 0);

    const hasNext = items.length === limit;
    return {
      products: productResults,
      nextCursor: hasNext ? String(offset + items.length) : undefined,
      hasNext,
    };
  } catch (err) {
    console.warn('Error searching products from Wix Stores:', err);
    return { products: [], hasNext: false };
  }
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
      const priceAmount = Number(
        primaryVariant?.price?.actualPrice?.amount ?? product.actualPriceRange?.minValue?.amount ?? 0
      );
      const desc = typeof product.description === 'string' ? product.description : '';

      return {
        productId: product._id,
        variantId: getVariantId(primaryVariant),
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

export async function getProductVariants(productId: string): Promise<ProductVariantsResult> {
  const version = await getStoreCatalogVersion();

  try {
    if (version === 'V3_CATALOG') {
      const product = await productsV3.getProduct(productId, {
        fields: [
          'VARIANT_OPTION_CHOICE_NAMES',
          'CURRENCY',
          'DIRECT_CATEGORIES_INFO',
        ] as any,
      });
      const rawOptions = (product as any)?.options || [];
      const options: ProductVariantOptions[] = rawOptions
        .map((option: any) => ({
          name: option.name || option.key || '',
          choices: (option.choicesSettings?.choices || [])
            .map((choice: any) => choice.name || choice.key || '')
            .filter(Boolean),
        }))
        .filter((option: ProductVariantOptions) => option.name && option.choices.length > 0);

      const variants = ((product as any)?.variantsInfo?.variants || [])
        .map((variant: any): ProductVariantChoice | null => {
          if (!variant?._id) return null;
          const choices: Record<string, string> = {};
          for (const choice of variant.choices || []) {
            const named = choice.optionChoiceNames;
            if (named?.optionName && named.choiceName) choices[named.optionName] = named.choiceName;
          }
          const price = Number(variant.price?.actualPrice?.amount || 0);
          return {
            variantId: variant._id,
            choices,
            price,
            currency: (product as any)?.currency || 'USD',
            inStock: variant.inventoryStatus?.inStock !== false,
          };
        })
        .filter((variant: ProductVariantChoice | null): variant is ProductVariantChoice => Boolean(variant));

      return { options, variants };
    }

    const response = await products.queryProductVariants(productId, { paging: { limit: 100 } });
    const variants = (response.variants || [])
      .map((item: any): ProductVariantChoice | null => {
        const variantId = item._id || item.variant?._id;
        if (!variantId) return null;
        return {
          variantId,
          choices: item.choices || {},
          price: Number(item.variant?.priceData?.discountedPrice || item.variant?.priceData?.price || 0),
          currency: item.variant?.priceData?.currency || 'USD',
          inStock: item.variant?.stock?.inventoryStatus !== 'OUT_OF_STOCK',
        };
      })
      .filter((variant: ProductVariantChoice | null): variant is ProductVariantChoice => Boolean(variant));

    const optionMap = new Map<string, Set<string>>();
    variants.forEach((variant) => {
      Object.entries(variant.choices).forEach(([name, value]) => {
        if (!optionMap.has(name)) optionMap.set(name, new Set());
        optionMap.get(name)?.add(value);
      });
    });
    const options = Array.from(optionMap, ([name, values]) => ({ name, choices: Array.from(values) }));
    return { options, variants };
  } catch (err) {
    console.warn(`Error getting variants for product ${productId}:`, err);
    return { options: [], variants: [] };
  }
}

export async function getProductVariantDetails(productId: string, variantId: string): Promise<ProductCandidate | null> {
  const product = await getProductDetails(productId);
  if (!product) return null;
  const variants = await getProductVariants(productId);
  const variant = variants.variants.find((item) => item.variantId === variantId);
  if (!variant) return null;
  return {
    ...product,
    variantId: variant.variantId,
    price: variant.price,
    currency: variant.currency,
    inStock: variant.inStock,
  };
}
