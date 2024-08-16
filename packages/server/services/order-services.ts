import { eq, inArray } from "drizzle-orm";
import type { Order, OrderProduct, ProductData } from "../../../types/products";
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

export const getAllOrders = async (): Promise<[boolean, Order[]?, Error?]> => {
  try {
    const allOrders = await db.select().from(orders).execute();
    return [true, allOrders, undefined];
  } catch (e) {
    if (e instanceof Error) {
      return [false, undefined, new Error("No se pudo obtener los pedidos")];
    }
    return [false, undefined, new Error("Internal server error")];
  }
};

export const updateOrderByNumber = async ({
  orderNumber,
  productsData,
}: { orderNumber: string; productsData: ProductData[] }): Promise<
  [boolean, Error?]
> => {
  const existingOrder = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1)
    .execute();

  if (!existingOrder || existingOrder.length === 0) {
    return [false, new Error("Order not found")];
  }

  const orderId = existingOrder[0].id;

  const [existingOrderProducts, dbProducts] = await Promise.all([
    db.select().from(orderProducts).where(eq(orderProducts.orderId, orderId)),
    db
      .select()
      .from(products)
      .where(
        inArray(
          products.id,
          productsData.map(p => p.productId),
        ),
      ),
  ]);

  const productQtyUpdates = existingOrderProducts.map(existingProduct => {
    const dbProduct = dbProducts.find(p => p.id === existingProduct.productId);
    if (!dbProduct) {
      throw new Error(`Product with id ${existingProduct.productId} not found`);
    }

    const updatedQty = dbProduct.qty + existingProduct.quantity;
    if (Number.isNaN(updatedQty)) {
      throw new Error(
        `Invalid quantity for product with id ${existingProduct.productId}`,
      );
    }

    return db
      .update(products)
      .set({ qty: updatedQty })
      .where(eq(products.id, existingProduct.productId));
  });

  await Promise.all(productQtyUpdates);

  // Remove existing products for the order
  await db.delete(orderProducts).where(eq(orderProducts.orderId, orderId));

  // Insert new products and update quantities
  const productOperations = productsData.map(async product => {
    const dbProduct = dbProducts.find(p => p.id === product.productId);
    if (!dbProduct) {
      throw new Error(`Product with id ${product.productId} not found`);
    }

    await db.insert(orderProducts).values({
      orderId,
      productId: product.productId,
      quantity: product.quantity,
    });

    const updatedQty = dbProduct.qty - product.quantity;

    await db
      .update(products)
      .set({ qty: updatedQty })
      .where(eq(products.id, product.productId));
  });

  await Promise.all(productOperations);

  const finalPrice = productsData
    .reduce((total, product) => {
      const dbProduct = dbProducts.find(p => p.id === product.productId);

      if (!dbProduct) {
        throw new Error(`Product with id ${product.productId} not found`);
      }

      const unitPrice = Number.parseFloat(dbProduct.unitPrice);
      return total + unitPrice * product.quantity;
    }, 0)
    .toFixed(2);

  const numberOfProducts = productsData.reduce(
    (total, product) => total + product.quantity,
    0,
  );

  await db
    .update(orders)
    .set({
      numberOfProducts,
      finalPrice: Number.parseFloat(finalPrice).toString(),
    })
    .where(eq(orders.id, orderId));

  return [true, undefined];
};
