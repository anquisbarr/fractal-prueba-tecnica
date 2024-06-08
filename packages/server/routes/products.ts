import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProducts,
} from "../controllers/productControllers";

const router = Router();

router.get("/products", getProducts);
router.post("/products", createProduct);
router.delete("/products/:id", deleteProduct);

export default router;
