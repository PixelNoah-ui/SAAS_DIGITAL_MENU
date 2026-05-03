import express from "express";
import { protect } from "../controller/authController.js";
import { restrictTo } from "../middleware/restrictTo.js";
import {
  createTable,
  deleteTable,
  getAdminTables,
  getTable,
  scanTable,
  updateTable,
} from "../controller/tableController.js";

const router = express.Router();

// Public route - get table by QR token
router.post("/scan", scanTable);

// Admin routes (protected)
router
  .route("/")
  .get(protect, restrictTo("ADMIN", "MANAGER"), getAdminTables)
  .post(protect, restrictTo("ADMIN", "MANAGER"), createTable);

router
  .route("/:id")
  .get(protect, restrictTo("ADMIN", "MANAGER"), getTable)
  .patch(protect, restrictTo("ADMIN", "MANAGER"), updateTable)
  .delete(protect, restrictTo("ADMIN", "MANAGER"), deleteTable);

export default router;
