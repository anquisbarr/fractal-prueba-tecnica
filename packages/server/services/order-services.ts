import { eq } from "drizzle-orm";
import type { Order, OrderProduct } from "../../../types/products";
import { db } from "../db/config";
import { orderProducts, orders, products } from "../db/schema";

type OrderId = number;

export const createOrderService = async ({
  orderNumber,
  productsData,
}: { orderNumber: string; productsData: ProductData[] }): Promise<
  [boolean, OrderId?, Error?]
> => {
  try {
    const productIds = productsData.map(p => p.productId);
    const dbProducts = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    const finalPrice = productsData
      .reduce((total: number, product: ProductData) => {
        const dbProduct = dbProducts.find(p => p.id === product.productId);
        if (!dbProduct) {
          throw new Error(`Product with id ${product.productId} not found`);
        }
        const unitPrice = Number.parseFloat(dbProduct.unitPrice);
        if (Number.isNaN(unitPrice)) {
          throw new Error(
            `Invalid unit price for product with id ${product.productId}`,
          );
        }
        return total + unitPrice * product.quantity;
      }, 0)
      .toFixed(2);

    const numberOfProducts = productsData.reduce(
      (total, product) => total + product.quantity,
      0,
    );

    const [insertResult] = await db
      .insert(orders)
      .values({
        orderNumber,
        date: new Date(),
        numberOfProducts,
        finalPrice: Number.parseFloat(finalPrice).toString(),
        status: "Pending",
      })
      .execute();

    const orderId = insertResult.insertId; // Capturar el ID de la inserción

    Promise.all(
      productsData.map(async product => {
        await db.insert(orderProducts).values({
          orderId,
          productId: product.productId,
          quantity: product.quantity,
        });

        // Ensure quantity is a number before updating
        const dbProduct = dbProducts.find(p => p.id === product.productId);
        if (!dbProduct) {
          throw new Error(`Product with id ${product.productId} not found`);
        }

        const updatedQty =
          typeof dbProduct.qty === "string"
            ? Number.parseFloat(dbProduct.qty) - product.quantity
            : dbProduct.qty - product.quantity;

        if (Number.isNaN(updatedQty)) {
          throw new Error(
            `Invalid quantity for product with id ${product.productId}`,
          );
        }

        await db
          .update(products)
          .set({
            qty: updatedQty,
          })
          .where(eq(products.id, product.productId));
      }),
    );

    return [true, orderId, undefined];
  } catch (e) {
    return [false, undefined, new Error("Error creating order")];
  }
};

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
