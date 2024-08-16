import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/config";
import { products } from "../db/schema";
import { getAllProducts } from "../services/product-services";

interface CreateProductRequest extends Request {
  body: {
    name: string;
    unitPrice: number;
    qty: number;
  };
}

export const getProducts = async (req: Request, res: Response) => {
  const [ok, products, err] = await getAllProducts();
  if (!ok && err) {
    return res.status(500).json({ message: err.message });
  }
  return res.status(200).json(products);
};

export const createProduct = async (
  req: CreateProductRequest,
  res: Response,
) => {
  const { name, unitPrice, qty } = req.body;

  try {
    const [result] = await db.insert(products).values({
      name,
      unitPrice: unitPrice.toFixed(2),
      qty,
    });

    const insertId = result.insertId;

    res
      .status(201)
      .json({ message: "Product created successfully", productId: insertId });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, unitPrice, qty } = req.body;
  try {
    await db
      .update(products)
      .set({ name, unitPrice, qty })
      .where(eq(products.id, Number.parseInt(id)));
    res.status(200).json({ message: "Product updated" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    await db.delete(products).where(eq(products.id, Number.parseInt(id)));
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};
