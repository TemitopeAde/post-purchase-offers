import type { APIRoute } from 'astro';
import { generateOffersForOrder } from '../../lib/recommendations/recommendation-service';
import { recordOfferEvent } from '../../lib/wix/data';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const orderId = body.orderId;

    if (!orderId || typeof orderId !== 'string') {
      return Response.json({ error: 'orderId is required' }, { status: 400 });
    }

    const result = await generateOffersForOrder(orderId.trim());

    if (!result || result.offers.length === 0) {
      return Response.json({ offers: [], message: 'No eligible post-purchase offers' }, { status: 200 });
    }

    // Automatically record impression events for the generated offers
    const sessionKey = body.sessionKey || `session_${Date.now()}`;
    for (const offer of result.offers) {
      await recordOfferEvent({
        campaignId: result.campaign.id,
        offerId: offer._id,
        productId: offer.productId,
        originalOrderId: orderId,
        eventType: 'impression',
        sessionKey,
        currency: offer.discountType ? undefined : undefined,
        amount: offer.offerPrice,
        aiRecommended: result.source === 'ai',
        recommendationReason: offer.reason,
      });
    }

    return Response.json(result, { status: 200 });
  } catch (err: any) {
    console.error('Error generating post-purchase recommendations:', err);
    return Response.json(
      { error: err?.message || 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
};
