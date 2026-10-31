import { cartV2 } from '@wix/ecom';
import { auth } from '@wix/essentials';
import { getProductDetails, getProductVariantDetails } from './catalog';
import { getCampaignById } from './data';
import { calculateOfferPrice } from '../recommendations/ranking';

export interface CreateOfferCheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  cartId?: string;
  /** Price charged for the offer item, computed server-side. */
  offerPrice?: number;
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
  const product = options.variantId
    ? await getProductVariantDetails(productId, options.variantId)
    : await getProductDetails(productId);
  if (!product) {
    return { success: false, error: 'Product not found in store catalog' };
  }

  if (!product.inStock) {
    return { success: false, error: 'This item is currently out of stock' };
  }

  // Always use the catalog's variant: the offer price is computed from it, and the
  // sale-price override below would otherwise apply to whatever variant a client sent.
  const variantId = product.variantId;

  // 2. Price the offer server-side from the campaign; never trust a client-sent price.
  const campaign = options.campaignId ? await getCampaignById(options.campaignId) : null;
  if (!campaign || campaign.status !== 'active') {
    return { success: false, error: 'This offer is no longer available' };
  }
  const offerPrice = calculateOfferPrice(product.price, campaign.discountType, campaign.discountValue);
  const discounted = offerPrice < product.price;

  try {
    // 3. Create a separate cart in Wix eCommerce
    // Wix Stores catalog references must use the Stores catalog provider app ID.
    // This is different from the Wix Stores host app definition ID used by site plugins.
    const STORES_CATALOG_APP_ID = '215238eb-22a5-4c36-9e7b-e7c08025e04e';

    // Elevated: this endpoint is called by site visitors, and overriding the catalog price
    // needs the app's admin eCommerce permission (ECOM.ADMIN_MODIFY_CHECKOUTS). Safe because
    // the price, variant and campaign above are all resolved server-side.
    const cart = await auth.elevate(cartV2.createCart)({
      catalogItems: [
        {
          catalogReference: {
            catalogItemId: productId,
            appId: STORES_CATALOG_APP_ID,
            options: variantId ? { variantId } : undefined,
          },
          quantity: 1,
          // Charge the offer price; fullPrice shows the regular price struck through at checkout.
          catalogOverrideFields: discounted
            ? { salePrice: offerPrice.toFixed(2), fullPrice: product.price.toFixed(2) }
            : undefined,
        },
      ],
    });

    const cartId = cart?._id;
    if (!cart || !cartId) {
      throw new Error('Failed to create cart with Wix eCommerce');
    }

    // Don't send the shopper to a checkout that charges something other than the offer.
    const cartPrice = Number(cart.lineItems?.[0]?.pricing?.unitPrice?.amount);
    if (Number.isFinite(cartPrice) && Math.abs(cartPrice - offerPrice) > 0.005) {
      console.error(
        `Offer price not applied to cart ${cartId}: expected ${offerPrice}, cart has ${cartPrice}. ` +
          'Check the app has the eCommerce permission needed to override catalog prices.'
      );
      return { success: false, error: "We couldn't apply this offer's price. Please try again later." };
    }

    // 4. Obtain Wix-hosted checkout URL for this cart
    // The cart was created by the app, so read its checkout URL as the app too.
    const checkoutResponse = await auth.elevate(cartV2.getCheckoutUrl)(cartId, {
      currencyCode: currency || product.currency,
    });

    if (!checkoutResponse || !checkoutResponse.checkoutUrl) {
      throw new Error('Failed to retrieve checkout URL from Wix eCommerce');
    }

    return {
      success: true,
      checkoutUrl: checkoutResponse.checkoutUrl,
      cartId,
      offerPrice,
    };
  } catch (err: any) {
    console.error('Error creating offer checkout:', err);
    return {
      success: false,
      error: err?.message || 'Could not initiate checkout for this offer',
    };
  }
}
