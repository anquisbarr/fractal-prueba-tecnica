import type { Request, Response } from "express";
import {
  createProductService,
  deleteProductService,
  getAllProducts,
  updateProductService,
} from "../services/product-services";

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

  if (!name || !unitPrice || !qty) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const [ok, productId, err] = await createProductService({
    name,
    unitPrice,
    qty,
  });

  if (!ok && err) {
    return res.status(500).json({ message: err.message });
  }

  return res
    .status(201)
    .json({ message: "Product created successfully", productId });
};

export const updateProduct = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, unitPrice, qty } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!name || !unitPrice || !qty) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const [ok, err] = await updateProductService({
    id,
    name,
    unitPrice,
    qty,
  });

  if (!ok && err) {
    return res.status(500).json({ message: err.message });
  }

  return res.status(200).json({ message: "Product updated" });
};

export const deleteProduct = async (req: Request, res: Response) => {
  const { id } = req.params;

  const [ok, err] = await deleteProductService(id);

  if (!ok && err) {
    return res.status(500).json({ message: err.message });
  }
  return res.status(200).json({ message: "Product deleted successfully" });
};
