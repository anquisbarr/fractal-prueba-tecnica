import { eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { db } from "../db/config";
import { products } from "../db/schema";

interface CreateProductRequest extends Request {
  body: {
    name: string;
    unitPrice: number;
    qty: number;
  };
}

export const getProducts = async (req: Request, res: Response) => {
  try {
    const allProducts = await db.select().from(products);
    res.json(allProducts);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const createProduct = async (
  req: CreateProductRequest,
  res: Response,
) => {
  const { name, unitPrice, qty } = req.body;

  try {
    const insertResult = await db.insert(products).values({
      name,
      unitPrice: unitPrice.toFixed(2), // Convertir el precio unitario a cadena con dos decimales
      qty,
    });

    const productId = Number(insertResult.insertId);

    res
      .status(201)
      .json({ message: "Product created successfully", productId });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
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
