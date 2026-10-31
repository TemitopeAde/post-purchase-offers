import { orders } from '@wix/ecom';

export interface OrderContext {
  orderId: string;
  orderNumber?: number;
  subtotal: number;
  currency: string;
  purchasedProductIds: string[];
  purchasedProducts: {
    productId: string;
    name: string;
    description?: string;
    price?: number;
    quantity?: number;
  }[];
  customerEmail?: string;
}

export async function getOrderContext(orderId: string): Promise<OrderContext | null> {
  if (!orderId || orderId.trim().length === 0) {
    return null;
  }

  try {
    const order = await orders.getOrder(orderId);
    if (!order || !order._id) {
      return null;
    }

    const purchasedProducts: OrderContext['purchasedProducts'] = [];
    const purchasedProductIds: string[] = [];

    for (const item of order.lineItems || []) {
      const prodId = item.catalogReference?.catalogItemId;
      if (prodId) {
        purchasedProductIds.push(prodId);
        purchasedProducts.push({
          productId: prodId,
          name: item.productName?.original || item.productName?.translated || 'Item',
          description: item.descriptionLines?.[0]?.plainText?.original,
          price: Number(item.price?.amount || 0),
          quantity: item.quantity,
        });
      }
    }

    const subtotal = Number(order.priceSummary?.subtotal?.amount || 0);
    const currency = order.currency || '';
    const orderNum =
      typeof order.number === 'string'
        ? parseInt(order.number, 10)
        : typeof order.number === 'number'
        ? order.number
        : undefined;

    return {
      orderId: order._id,
      orderNumber: orderNum,
      subtotal,
      currency,
      purchasedProductIds,
      purchasedProducts,
      customerEmail: order.buyerInfo?.email || undefined,
    };
  } catch (err) {
    console.warn(`Could not fetch order ${orderId}:`, err);
    return null;
  }
}
