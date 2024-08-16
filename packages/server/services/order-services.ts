import { eq } from "drizzle-orm";
import type { Order, OrderProduct } from "../../../types/products";
import { db } from "../db/config";
import { orderProducts, orders } from "../db/schema";

export const getOrderByNumber = async (
  orderNumber: string,
): Promise<[boolean, Order?, OrderProduct[]?, Error?]> => {
  try {
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber))
      .limit(1)
      .execute();

    if (!order || order.length === 0) {
      return [false, undefined, undefined, new Error("Order not found")];
    }

    const orderProductsList = await db
      .select()
      .from(orderProducts)
      .where(eq(orderProducts.orderId, order[0].id))
      .execute();

    return [true, order[0], orderProductsList, undefined];
  } catch (e) {
    if (e instanceof Error) {
      return [false, undefined, undefined, e];
    }
    return [false, undefined, undefined, new Error("Internal server error")];
  }
};
