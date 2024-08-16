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
