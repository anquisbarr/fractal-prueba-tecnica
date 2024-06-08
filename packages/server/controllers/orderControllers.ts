import { eq, inArray } from "drizzle-orm";
import type { Request, Response } from "express";
import type { ProductData } from "../../../types/products";
import { db } from "../db/config";
import { orderProducts, orders, products } from "../db/schema";

interface CreateOrderRequest extends Request {
  body: {
    orderNumber: string;
    productsData?: ProductData[];
  };
}

export const getOrderByOrderNumber = async (req: Request, res: Response) => {
  const { orderNumber } = req.params;

  try {
    const order = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber))
      .limit(1)
      .execute();

    if (!order || order.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderProductsList = await db
      .select()
      .from(orderProducts)
      .where(eq(orderProducts.orderId, order[0].id))
      .execute();

    res.json({ ...order[0], productsData: orderProductsList });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const allOrders = await db.select().from(orders);
    res.json(allOrders);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const createOrder = async (req: CreateOrderRequest, res: Response) => {
  const { orderNumber, productsData } = req.body;

  if (!productsData || productsData.length === 0) {
    return res
      .status(400)
      .json({ message: "productsData is required and should not be empty" });
  }

  try {
    const productIds = productsData.map(p => p.productId);
    const dbProducts = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    // Calculate the final price
    const finalPrice = productsData
      .reduce((total: number, product: ProductData) => {
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

    const insertResult = await db.insert(orders).values({
      orderNumber,
      date: new Date(),
      numberOfProducts,
      finalPrice: Number.parseFloat(finalPrice).toString(),
      status: "Pending",
    });

    const orderId = Number(insertResult.insertId);

    for (const product of productsData) {
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
    }

    res.status(201).json({ message: "Order created successfully", orderId });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const updateOrder = async (req: CreateOrderRequest, res: Response) => {
  const { orderNumber } = req.params;
  const { productsData } = req.body;

  if (!productsData || productsData.length === 0) {
    return res
      .status(400)
      .json({ message: "productsData is required and should not be empty" });
  }

  try {
    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.orderNumber, orderNumber))
      .limit(1)
      .execute();

    if (!existingOrder || existingOrder.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderId = existingOrder[0].id;

    // Fetch existing order products
    const existingOrderProducts = await db
      .select()
      .from(orderProducts)
      .where(eq(orderProducts.orderId, orderId))
      .execute();

    // Adjust the product quantities before deleting the order products
    for (const existingProduct of existingOrderProducts) {
      const dbProduct = await db
        .select()
        .from(products)
        .where(eq(products.id, existingProduct.productId))
        .limit(1)
        .execute();

      if (!dbProduct || dbProduct.length === 0) {
        throw new Error(
          `Product with id ${existingProduct.productId} not found`,
        );
      }

      const updatedQty = dbProduct[0].qty + existingProduct.quantity;

      if (Number.isNaN(updatedQty)) {
        throw new Error(
          `Invalid quantity for product with id ${existingProduct.productId}`,
        );
      }

      await db
        .update(products)
        .set({
          qty: updatedQty,
        })
        .where(eq(products.id, existingProduct.productId));
    }

    // Remove existing products for the order
    await db.delete(orderProducts).where(eq(orderProducts.orderId, orderId));

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
        return total + unitPrice * product.quantity;
      }, 0)
      .toFixed(2);

    const numberOfProducts = productsData.reduce(
      (total, product) => total + product.quantity,
      0,
    );

    for (const product of productsData) {
      await db.insert(orderProducts).values({
        orderId,
        productId: product.productId,
        quantity: product.quantity,
      });

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
    }

    await db
      .update(orders)
      .set({
        numberOfProducts,
        finalPrice: Number.parseFloat(finalPrice).toString(),
      })
      .where(eq(orders.id, orderId));

    res.status(200).json({ message: "Order updated successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const deleteOrder = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    // Elimina las relaciones de order_products primero
    await db
      .delete(orderProducts)
      .where(eq(orderProducts.orderId, Number.parseInt(id)));
    // Luego elimina la orden
    await db.delete(orders).where(eq(orders.id, Number.parseInt(id)));
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
