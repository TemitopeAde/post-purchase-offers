import type { APIRoute } from 'astro';
import { createOfferCheckout } from '../../../lib/wix/checkout';
import { recordOfferEvent } from '../../../lib/wix/data';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    // The offer price is computed server-side from the campaign; any client-sent price is ignored.
    const { productId, variantId, campaignId, offerId, originalOrderId, sessionKey, currency } = body;

    if (!productId) {
      return Response.json({ error: 'productId is required' }, { status: 400 });
    }

    const result = await createOfferCheckout({
      productId,
      variantId,
      campaignId,
      offerId,
      currency,
    });

    if (!result.success || !result.checkoutUrl) {
      return Response.json(
        { error: result.error || 'Could not initiate checkout for this offer' },
        { status: 400 }
      );
    }

    // Record checkout_started event
    await recordOfferEvent({
      campaignId: campaignId || 'default',
      offerId,
      productId,
      originalOrderId,
      eventType: 'checkout_started',
      sessionKey: sessionKey || `session_${Date.now()}`,
      currency,
      amount: result.offerPrice,
    });

    return Response.json({
      success: true,
      checkoutUrl: result.checkoutUrl,
      cartId: result.cartId,
    }, { status: 200 });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Checkout initiation failed' }, { status: 500 });
  }
};
