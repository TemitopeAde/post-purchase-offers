import type { APIRoute } from 'astro';
import { appInstances } from '@wix/app-management';

export const GET: APIRoute = async () => {
  try {
    const instance = await appInstances.getAppInstance();
    console.log(JSON.stringify(instance, null, 2));
    return Response.json(instance, { status: 200 });
  } catch (error) {
    console.error('Wix SDK Get App Instance failed:', error);
    return Response.json({ error: 'Failed to retrieve the Wix app instance' }, { status: 502 });
  }
};
