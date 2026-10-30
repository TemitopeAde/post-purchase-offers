import type { APIRoute } from 'astro';
import { recordOfferEvent } from '../../../lib/wix/data';
import type { EventType } from '../../../lib/types';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { campaignId, offerId, productId, originalOrderId, eventType, sessionKey, amount, currency } = body;

    if (!eventType || !productId) {
      return Response.json({ error: 'eventType and productId are required' }, { status: 400 });
    }

    const recorded = await recordOfferEvent({
      campaignId: campaignId || 'default',
      offerId,
      productId,
      originalOrderId,
      eventType: eventType as EventType,
      sessionKey: sessionKey || `session_${Date.now()}`,
      currency,
      amount: amount ? Number(amount) : undefined,
    });

    return Response.json({ success: true, eventId: recorded._id }, { status: 200 });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Failed to record interaction' }, { status: 500 });
  }
};
