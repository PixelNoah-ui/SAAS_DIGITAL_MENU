import express from "express";
import { protect } from "../controller/authController.js";
import { restrictTo } from "../middleware/restrictTo.js";
import {
  createOrReuseOrderSession,
  createOrder,
  getOrdersBySession,
  getOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
} from "../controller/orderController.js";

const router = express.Router();

router.post("/sessions", createOrReuseOrderSession);
router.get("/session", getOrdersBySession);
router.post("/", createOrder);

router.use(protect, restrictTo("ADMIN", "MANAGER"));
router.get("/", getOrders);
router.get("/:id", getOrder);
router.patch("/:id", updateOrderStatus);
router.delete("/:id", deleteOrder);

export default router;
