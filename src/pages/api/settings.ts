import type { APIRoute } from 'astro';
import { getAppSettings, updateAppSettings } from '../../lib/wix/data';

export const GET: APIRoute = async () => {
  try {
    const settings = await getAppSettings();
    return Response.json(settings, { status: 200 });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Failed to fetch settings' }, { status: 500 });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    const updates = await request.json();
    const updated = await updateAppSettings(updates);
    return Response.json(updated, { status: 200 });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Failed to update settings' }, { status: 500 });
  }
};
