import type { APIRoute } from 'astro';
import { getCampaigns, createCampaign, saveOffer } from '../../../lib/wix/data';
import type { Campaign } from '../../../lib/types';
import { campaignFormSchema } from '../../../lib/validation/campaign';
import { checkCampaignActivation } from '../../../lib/wix/billing';
import { getProductDetails } from '../../../lib/wix/catalog';
import { calculateOfferPrice } from '../../../lib/recommendations/ranking';

type CreateCampaignBody = Partial<Omit<Campaign, '_id'>> & {
  manualProductIds?: unknown[];
};

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
    const body = (await request.json()) as CreateCampaignBody;
    const parsed = campaignFormSchema.safeParse({
      name: body.name,
      discount: body.discountValue,
      minSubtotal: body.minOrderSubtotal,
      mode: body.recommendationMode,
    });

    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message || 'Invalid campaign data' }, { status: 400 });
    }

    if (body.status === 'active') {
      const limitError = await checkCampaignActivation();
      if (limitError) return Response.json({ error: limitError }, { status: 403 });
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
      currency: typeof body.currency === 'string' ? body.currency : '',
      recommendationMode: parsed.data.mode,
      maxOffers: Number(body.maxOffers || 4),
      fallbackMode: body.fallbackMode || 'RULES',
      discountType: body.discountType || 'PERCENTAGE',
      discountValue: parsed.data.discount,
      displayHeading: body.displayHeading,
      displaySubheading: body.displaySubheading,
      ctaText: body.ctaText || 'Claim Offer',
    });

    const manualProductIds = Array.isArray(body.manualProductIds)
      ? body.manualProductIds.filter((id): id is string => typeof id === 'string' && id.length > 0)
      : [];
    if (created._id && manualProductIds.length > 0 && (parsed.data.mode === 'MANUAL' || parsed.data.mode === 'HYBRID')) {
      const products = await Promise.all(manualProductIds.map((productId) => getProductDetails(productId)));
      await Promise.all(
        products
          .filter((product): product is NonNullable<typeof product> => Boolean(product))
          .map((product, index) => saveOffer({
            campaignId: created._id as string,
            productId: product.productId,
            variantId: product.variantId,
            productName: product.name,
            productImageUrl: product.imageUrl,
            regularPrice: product.price,
            currency: product.currency,
            discountType: body.discountType || 'PERCENTAGE',
            discountValue: parsed.data.discount,
            offerPrice: calculateOfferPrice(product.price, body.discountType || 'PERCENTAGE', parsed.data.discount),
            title: product.name,
            description: product.description || '',
            badge: 'Selected by you',
            priority: index + 1,
            active: true,
            reason: 'Selected manually by the merchant.',
          })),
      );
    }

    return Response.json(created, { status: 201 });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Failed to create campaign' }, { status: 500 });
  }
};
