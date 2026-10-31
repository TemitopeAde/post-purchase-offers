import type { APIRoute } from 'astro';
import { getCampaignById, updateCampaign, deleteCampaign } from '../../../lib/wix/data';
import { checkCampaignActivation } from '../../../lib/wix/billing';

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
    const updates = await request.json();
    if (updates.status === 'active') {
      const limitError = await checkCampaignActivation(id);
      if (limitError) return Response.json({ error: limitError }, { status: 403 });
    }

    const updated = await updateCampaign(id, updates);
    if (!updated) return Response.json({ error: 'Campaign not found' }, { status: 404 });

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
