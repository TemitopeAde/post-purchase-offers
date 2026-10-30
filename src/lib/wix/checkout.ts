import { cartV2 } from '@wix/ecom';
import { getProductDetails } from './catalog';

export interface CreateOfferCheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  cartId?: string;
  error?: string;
}

export async function createOfferCheckout(options: {
  productId: string;
  variantId?: string;
  campaignId?: string;
  offerId?: string;
  currency?: string;
}): Promise<CreateOfferCheckoutResult> {
  const { productId, currency } = options;

  if (!productId) {
    return { success: false, error: 'Product ID is required' };
  }

  // 1. Authoritative verification of product availability
  const product = await getProductDetails(productId);
  if (!product) {
    return { success: false, error: 'Product not found in store catalog' };
  }

  if (!product.inStock) {
    return { success: false, error: 'This item is currently out of stock' };
  }

  try {
    // 2. Create a separate cart in Wix eCommerce
    const STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfcd';

    const cart = await cartV2.createCart({
      catalogItems: [
        {
          catalogReference: {
            catalogItemId: productId,
            appId: STORES_APP_ID,
            options: options.variantId ? { variantId: options.variantId } : undefined,
          },
          quantity: 1,
        },
      ],
    });

    const cartId = cart?._id;
    if (!cart || !cartId) {
      throw new Error('Failed to create cart with Wix eCommerce');
    }

    // 3. Obtain Wix-hosted checkout URL for this cart
    const checkoutResponse = await cartV2.getCheckoutUrl(cartId, {
      currencyCode: currency || product.currency,
    });

    if (!checkoutResponse || !checkoutResponse.checkoutUrl) {
      throw new Error('Failed to retrieve checkout URL from Wix eCommerce');
    }

    return {
      success: true,
      checkoutUrl: checkoutResponse.checkoutUrl,
      cartId,
    };
  } catch (err: any) {
    console.error('Error creating offer checkout:', err);
    return {
      success: false,
      error: err?.message || 'Could not initiate checkout for this offer',
    };
  }
}
