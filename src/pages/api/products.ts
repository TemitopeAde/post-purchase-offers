import type { APIRoute } from 'astro';
import { searchProductCandidates } from '../../lib/wix/catalog';

export const GET: APIRoute = async ({ url }) => {
  try {
    const limit = Number(url.searchParams.get('limit') || 20);
    const query = url.searchParams.get('q') || '';
    const cursor = url.searchParams.get('cursor') || undefined;
    return Response.json(await searchProductCandidates({ query, cursor, limit }), { status: 200 });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Failed to load products' }, { status: 500 });
  }
};
