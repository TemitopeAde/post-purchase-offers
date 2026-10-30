import type { APIRoute } from 'astro';
import { getCampaignById, updateCampaign } from '../../../../lib/wix/data';

export const POST: APIRoute = async ({ params }) => {
  const { id } = params;
  if (!id) return Response.json({ error: 'ID is required' }, { status: 400 });

  const camp = await getCampaignById(id);
  if (!camp) return Response.json({ error: 'Campaign not found' }, { status: 404 });

  // Validate campaign settings before activation
  if (!camp.name || camp.name.trim().length === 0) {
    return Response.json({ error: 'Campaign must have a valid name' }, { status: 400 });
  }

  const updated = await updateCampaign(id, {
    status: camp.status === 'active' ? 'paused' : 'active',
  });

  return Response.json(updated, { status: 200 });
};
