import { Router } from "express";
import {
  createOrder,
  deleteOrder,
  getOrderByOrderNumber,
  getOrders,
  updateOrder,
  updateOrderStatus,
} from "../controllers/orderControllers";
const router = Router();

router.get("/orders", getOrders);
router.get("/orders/:orderNumber", getOrderByOrderNumber);
router.put("/orders/:orderNumber", updateOrder);
router.patch("/orders/:orderNumber/status", updateOrderStatus);
router.post("/orders", createOrder);
router.delete("/orders/:id", deleteOrder);

export default router;
