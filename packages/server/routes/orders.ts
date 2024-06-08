import { Router } from "express";
import {
  createOrder,
  deleteOrder,
  getOrders,
} from "../controllers/orderControllers";
const router = Router();

router.get("/orders", getOrders);
router.post("/orders", createOrder);
router.delete("/orders/:id", deleteOrder);

export default router;
