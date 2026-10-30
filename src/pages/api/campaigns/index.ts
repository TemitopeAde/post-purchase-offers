import type { APIRoute } from 'astro';
import { getCampaigns, createCampaign } from '../../../lib/wix/data';
import type { Campaign } from '../../../lib/types';

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
    const body = (await request.json()) as Omit<Campaign, '_id'>;
    if (!body.name || body.name.trim().length === 0) {
      return Response.json({ error: 'Campaign name is required' }, { status: 400 });
    }

    const created = await createCampaign({
      name: body.name.trim(),
      description: body.description || '',
      status: body.status || 'draft',
      priority: Number(body.priority || 1),
      startAt: body.startAt,
      endAt: body.endAt,
      triggerProductIds: body.triggerProductIds || [],
      triggerCollectionIds: body.triggerCollectionIds || [],
      excludedProductIds: body.excludedProductIds || [],
      excludedCollectionIds: body.excludedCollectionIds || [],
      minOrderSubtotal: Number(body.minOrderSubtotal || 0),
      maxOrderSubtotal: body.maxOrderSubtotal ? Number(body.maxOrderSubtotal) : undefined,
      currency: body.currency || 'USD',
      recommendationMode: body.recommendationMode || 'AI',
      maxOffers: Number(body.maxOffers || 2),
      fallbackMode: body.fallbackMode || 'RULES',
      discountType: body.discountType || 'PERCENTAGE',
      discountValue: Number(body.discountValue || 10),
      displayHeading: body.displayHeading,
      displaySubheading: body.displaySubheading,
      ctaText: body.ctaText || 'Claim Offer',
    });

    return Response.json(created, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Failed to create campaign' }, { status: 500 });
  }
};
