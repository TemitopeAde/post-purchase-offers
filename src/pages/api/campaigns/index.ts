import type { APIRoute } from 'astro';
import { getCampaigns, createCampaign } from '../../../lib/wix/data';
import type { Campaign } from '../../../lib/types';
import { campaignFormSchema } from '../../../lib/validation/campaign';

export const GET: APIRoute = async () => {
  try {
    const list = await getCampaigns();
    return Response.json(list, { status: 200 });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Failed to list campaigns' }, { status: 500 });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as Partial<Omit<Campaign, '_id'>>;
    const parsed = campaignFormSchema.safeParse({
      name: body.name,
      discount: body.discountValue,
      minSubtotal: body.minOrderSubtotal,
      mode: body.recommendationMode,
    });

    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message || 'Invalid campaign data' }, { status: 400 });
    }

    const created = await createCampaign({
      name: parsed.data.name,
      description: body.description || '',
      status: body.status || 'draft',
      priority: Number(body.priority || 1),
      startAt: body.startAt,
      endAt: body.endAt,
      triggerProductIds: body.triggerProductIds || [],
      triggerCollectionIds: body.triggerCollectionIds || [],
      excludedProductIds: body.excludedProductIds || [],
      excludedCollectionIds: body.excludedCollectionIds || [],
      minOrderSubtotal: parsed.data.minSubtotal,
      maxOrderSubtotal: body.maxOrderSubtotal ? Number(body.maxOrderSubtotal) : undefined,
      currency: body.currency || 'USD',
      recommendationMode: parsed.data.mode,
      maxOffers: Number(body.maxOffers || 2),
      fallbackMode: body.fallbackMode || 'RULES',
      discountType: body.discountType || 'PERCENTAGE',
      discountValue: parsed.data.discount,
      displayHeading: body.displayHeading,
      displaySubheading: body.displaySubheading,
      ctaText: body.ctaText || 'Claim Offer',
    });

    return Response.json(created, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Failed to create campaign' }, { status: 500 });
  }
};
