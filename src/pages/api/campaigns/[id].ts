import type { APIRoute } from 'astro';
import { getCampaignById, updateCampaign, deleteCampaign } from '../../../lib/wix/data';
import { checkCampaignActivation } from '../../../lib/wix/billing';
import { campaignFormSchema } from '../../../lib/validation/campaign';

export const GET: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return Response.json({ error: 'ID is required' }, { status: 400 });

  const camp = await getCampaignById(id);
  if (!camp) return Response.json({ error: 'Campaign not found' }, { status: 404 });

  return Response.json(camp, { status: 200 });
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
      mode: updates.recommendationMode ?? existing.recommendationMode,
    });
    if (!parsed.success) {
      return Response.json({ error: parsed.error.issues[0]?.message || 'Invalid campaign data' }, { status: 400 });
    }

    if (updates.status === 'active') {
      const limitError = await checkCampaignActivation(id);
      if (limitError) return Response.json({ error: limitError }, { status: 403 });
    }

    const updated = await updateCampaign(id, {
      ...updates,
      name: parsed.data.name,
      discountValue: parsed.data.discount,
      minOrderSubtotal: parsed.data.minSubtotal,
      recommendationMode: parsed.data.mode,
    });

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
