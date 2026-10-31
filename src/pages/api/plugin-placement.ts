import type { APIRoute } from 'astro';
import { httpClient } from '@wix/essentials';

const PLUGIN_ID = 'd0e801b8-b18c-487f-82bb-25c64e2f1a62';
const PLACEMENT_STATUS_URL = 'https://www.wixapis.com/app-plugins/v1/site-plugins/placement-status';
const { fetchWithAuth } = httpClient;

type PlacementStatus = {
  pluginId?: string;
  placedInSlot?: boolean;
};

export const GET: APIRoute = async () => {
  try {
    const response = await fetchWithAuth(PLACEMENT_STATUS_URL);
    const payload = (await response.json()) as { placementStatuses?: PlacementStatus[] };

    if (!response.ok) {
      return Response.json(
        { error: 'Wix could not read the site plugin placement status.' },
        { status: response.status },
      );
    }

    const placement = payload.placementStatuses?.find((status) => status.pluginId === PLUGIN_ID);
    return Response.json({
      pluginId: PLUGIN_ID,
      placedInSlot: placement?.placedInSlot === true,
      placementFound: Boolean(placement),
    });
  } catch (error) {
    console.error('[Post-Purchase Offers] Failed to read plugin placement status:', error);
    return Response.json(
      { error: 'Failed to read the Wix site plugin placement status.' },
      { status: 502 },
    );
  }
};
