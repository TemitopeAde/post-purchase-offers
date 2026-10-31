import type { APIRoute } from 'astro';
import { getProductVariants } from '../../lib/wix/catalog';

export const GET: APIRoute = async ({ url }) => {
  const productId = url.searchParams.get('productId');
  if (!productId) return Response.json({ error: 'productId is required' }, { status: 400 });

  try {
    return Response.json(await getProductVariants(productId), { status: 200 });
  } catch (err: any) {
    return Response.json({ error: err?.message || 'Failed to load product options' }, { status: 500 });
  }
};
