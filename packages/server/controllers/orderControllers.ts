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
        const unitPrice = Number(dbProduct.unitPrice);
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
      finalPrice: Number(finalPrice).toFixed(2),
      status: "Pending",
    });

    const orderId = Number(insertResult.insertId);

    for (const product of productsData) {
      await db.insert(orderProducts).values({
        orderId,
        productId: product.productId,
        quantity: product.quantity,
      });
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
