import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import type { ProductData } from "../../../types/products";
import { db } from "../db/config";
import { orderProducts, orders } from "../db/schema";
import {
  createOrderService,
  getAllOrders,
  getOrderByNumber,
  updateOrderByNumber,
  updateOrderStatusByNumber,
} from "../services/order-services";

interface CreateOrderRequest extends Request {
  body: {
    orderNumber: string;
    productsData?: ProductData[];
  };
}

export const createOrder = async (req: CreateOrderRequest, res: Response) => {
  const { orderNumber, productsData } = req.body;

  if (!productsData || productsData.length === 0) {
    return res
      .status(400)
      .json({ message: "productsData is required and should not be empty" });
  }

  const [ok, orderId, err] = await createOrderService({
    orderNumber,
    productsData,
  });
  if (!ok && err) {
    return res.status(500).json({
      message: err.message,
    });
  }
  return res
    .status(201)
    .json({ message: "Order created successfully", orderId });
};

export const getOrderByOrderNumber = async (req: Request, res: Response) => {
  const { orderNumber } = req.params;

  const [ok, order, orderProductsList, error] =
    await getOrderByNumber(orderNumber);

  if (!ok) {
    if (error instanceof Error) {
      return res.status(500).json({ message: error.message });
    }
    return res.status(500).json({ message: "Internal server error" });
  }

  return res.status(200).json({ ...order, productsData: orderProductsList });
};

export const getOrders = async (_: Request, res: Response) => {
  const [ok, allOrders, err] = await getAllOrders();

  if (!ok && err) {
    return res.status(500).json({
      message: err.message,
    });
  }
  return res.status(200).json({ orders: allOrders });
};

export const updateOrder = async (req: CreateOrderRequest, res: Response) => {
  const { orderNumber } = req.params;
  const { productsData } = req.body;

  if (!productsData || productsData.length === 0) {
    return res
      .status(400)
      .json({ message: "productsData is required and should not be empty" });
  }

  const [ok, error] = await updateOrderByNumber({ orderNumber, productsData });

  if (!ok && error) {
    return res.status(500).json({
      message: error.message,
    });
  }
  return res.status(200).json({ message: "Order updated successfully" });
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const { orderNumber } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const [ok, error] = await updateOrderStatusByNumber({
    orderNumber,
    status,
  });

  if (!ok && error) {
    return res.status(500).json({ message: error.message });
  }
  return res.status(200).json({ message: "Order status updated successfully" });
};

export const deleteOrder = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const existingOrder = await db
      .select()
      .from(orders)
      .where(eq(orders.id, Number.parseInt(id)))
      .limit(1)
      .execute();

    if (!existingOrder || existingOrder.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (existingOrder[0].status === "Completed") {
      return res
        .status(400)
        .json({ message: "Completed orders cannot be modified" });
    }
    await db
      .delete(orderProducts)
      .where(eq(orderProducts.orderId, Number.parseInt(id)));

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
