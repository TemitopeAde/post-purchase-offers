import type { APIRoute } from 'astro';
import { getCampaignById, updateCampaign, deleteCampaign, getOffersByCampaign, removeOffersByCampaign, saveOffer } from '../../../lib/wix/data';
import { checkCampaignActivation } from '../../../lib/wix/billing';
import { campaignFormSchema } from '../../../lib/validation/campaign';
import { getProductDetails } from '../../../lib/wix/catalog';
import { calculateOfferPrice } from '../../../lib/recommendations/ranking';

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return Response.json({ error: 'ID is required' }, { status: 400 });

  const camp = await getCampaignById(id);
  if (!camp) return Response.json({ error: 'Campaign not found' }, { status: 404 });

  const offers = await getOffersByCampaign(id);
  return Response.json({
    ...camp,
    manualProducts: offers
      .filter((offer) => offer.active)
      .sort((a, b) => a.priority - b.priority)
      .map((offer) => ({
        productId: offer.productId,
        variantId: offer.variantId,
        name: offer.productName || offer.title,
        description: offer.description || '',
        price: offer.regularPrice,
        currency: camp.currency,
        imageUrl: offer.productImageUrl,
        inStock: true,
      })),
  }, { status: 200 });
};

export const PATCH: APIRoute = async ({ params, request }) => {
  const { id } = params;
  if (!id) return Response.json({ error: 'ID is required' }, { status: 400 });

  try {
    const updates = (await request.json()) as Record<string, unknown>;
    const existing = await getCampaignById(id);
    if (!existing) return Response.json({ error: 'Campaign not found' }, { status: 404 });

    const parsed = campaignFormSchema.safeParse({
      name: updates.name ?? existing.name,
      discount: updates.discountValue ?? existing.discountValue,
      minSubtotal: updates.minOrderSubtotal ?? existing.minOrderSubtotal ?? 0,
      priority: updates.priority ?? existing.priority ?? 1,
      mode: updates.recommendationMode ?? existing.recommendationMode,
    });
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message || 'Invalid campaign data' }, { status: 400 });
    }

    if (updates.status === 'active') {
      const limitError = await checkCampaignActivation(id);
      if (limitError) return Response.json({ error: limitError }, { status: 403 });
    }

    const { manualProductIds: _manualProductIds, ...campaignUpdates } = updates;
    const updated = await updateCampaign(id, {
      ...campaignUpdates,
      name: parsed.data.name,
      discountValue: parsed.data.discount,
      priority: parsed.data.priority,
      minOrderSubtotal: parsed.data.minSubtotal,
      recommendationMode: parsed.data.mode,
    });
    if (!updated) return Response.json({ error: 'Campaign could not be updated' }, { status: 500 });

    const manualProductIds = Array.isArray(updates.manualProductIds)
      ? updates.manualProductIds.filter((productId): productId is string => typeof productId === 'string' && productId.length > 0)
      : undefined;
    if (manualProductIds && (parsed.data.mode === 'MANUAL' || parsed.data.mode === 'HYBRID')) {
      await removeOffersByCampaign(id);
      const products = await Promise.all(manualProductIds.map((productId) => getProductDetails(productId)));
      await Promise.all(
        products
          .filter((product): product is NonNullable<typeof product> => Boolean(product))
          .map((product, index) => saveOffer({
            campaignId: id,
            productId: product.productId,
            variantId: product.variantId,
            productName: product.name,
            productImageUrl: product.imageUrl,
            regularPrice: product.price,
            currency: product.currency,
            discountType: updated.discountType,
            discountValue: updated.discountValue,
            offerPrice: calculateOfferPrice(product.price, updated.discountType, updated.discountValue),
            title: product.name,
            description: product.description || '',
            badge: 'Selected by you',
            priority: index + 1,
            active: true,
            reason: 'Selected manually by the merchant.',
          })),
      );
    }

    return Response.json(updated, { status: 200 });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Failed to update campaign' }, { status: 500 });
  }
};

export const DELETE: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return Response.json({ error: 'ID is required' }, { status: 400 });

  const success = await deleteCampaign(id);
  return Response.json({ success }, { status: 200 });
};
