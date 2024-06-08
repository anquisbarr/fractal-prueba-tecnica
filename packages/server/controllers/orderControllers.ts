import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import type { ProductData } from "../../../types/products";
import { db } from "../db/config";
import { orderProducts, orders } from "../db/schema";

interface CreateOrderRequest extends Request {
  body: {
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
  const { productsData } = req.body;

  if (!productsData || productsData.length === 0) {
    return res
      .status(400)
      .json({ message: "productsData is required and should not be empty" });
  }

  const orderNumber = Math.floor(Math.random() * 100000).toString();

  try {
    const insertResult = await db.insert(orders).values({
      orderNumber,
      date: new Date(),
      numberOfProducts: productsData.length,
      finalPrice: productsData
        .reduce(
          (total: number, product: ProductData) =>
            total + product.unitPrice * product.qty,
          0,
        )
        .toFixed(2), // Convertimos el total a cadena con dos decimales
      status: "Pending",
    });

    const orderId = Number(insertResult.insertId);

    for (const product of productsData) {
      await db.insert(orderProducts).values({
        orderId,
        productId: product.id,
        quantity: product.qty,
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
