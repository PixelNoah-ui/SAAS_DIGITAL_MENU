import express from "express";
import { protect } from "../controller/authController.js";
import { restrictTo } from "../middleware/restrictTo.js";
import { requireSession } from "../middleware/sessionMiddleware.js";
import {
  createOrder,
  getOrdersBySession,
  getOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
  getUnreadOrderCount,
  markOrdersRead,
  getAdminOrders,
} from "../controller/orderController.js";

const router = express.Router();

// Protected by session cookie - no token in URL
router.post("/", createOrder);
router.get("/session", requireSession, getOrdersBySession);

router.use(protect, restrictTo("ADMIN", "MANAGER"));

router.get("/", getOrders).get("/adminOrders", getAdminOrders);
router.get("/unread-count", getUnreadOrderCount);
router.patch("/mark-read", markOrdersRead);
router.patch("/mark-as-read", markOrdersRead);
router.get("/:id", getOrder);
router.patch("/:id", updateOrderStatus);
router.delete("/:id", deleteOrder);

export default router;
