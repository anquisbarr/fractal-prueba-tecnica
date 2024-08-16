import { eq } from "drizzle-orm";
import type { Product } from "../../../types/products";
import { db } from "../db/config";
import { products } from "../db/schema";

export const getAllProducts = async (): Promise<
  [boolean, Product[]?, Error?]
> => {
  try {
    const allProducts = await db.select().from(products).execute();
    return [true, allProducts, undefined];
  } catch (e) {
    if (e instanceof Error) {
      return [false, undefined, new Error("No se pudo obtener los pedidos")];
    }
    return [false, undefined, new Error("Internal server error")];
  }
};

export const createProductService = async ({
  name,
  unitPrice,
  qty,
}: { name: string; unitPrice: number; qty: number }): Promise<
  [boolean, number?, Error?]
> => {
  try {
    const [result] = await db.insert(products).values({
      name,
      unitPrice: unitPrice.toFixed(2),
      qty,
    });

    const insertId = result.insertId;

    return [true, insertId, undefined];
  } catch (e) {
    return [false, undefined, new Error("Internal server error")];
  }
};

export const updateProductService = async ({
  id,
  name,
  unitPrice,
  qty,
}: { id: string; name: string; unitPrice: string; qty: number }): Promise<
  [boolean, Error?]
> => {
  try {
    await db
      .update(products)
      .set({ name, unitPrice, qty })
      .where(eq(products.id, Number.parseInt(id)));
    return [true, undefined];
  } catch (e) {
    return [false, new Error("Internal server error")];
  }
};
