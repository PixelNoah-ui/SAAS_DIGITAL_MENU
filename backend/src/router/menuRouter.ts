import express from "express";
import { protect } from "../controller/authController.js";
import { restrictTo } from "../middleware/restrictTo.js";
import { upload, processProductImage } from "../middleware/uploadImages.js";
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItem,
  getMenuItems,
  getCategories,
  updateMenuItem,
} from "../controller/menuController.js";

const router = express.Router();

router
  .route("/")
  .get(getMenuItems)
  .post(
    protect,
    restrictTo("ADMIN", "MANAGER"),
    upload.single("image"),
    processProductImage,
    createMenuItem,
  );
router
  .route("/:id")
  .get(getMenuItem)
  .patch(
    protect,
    restrictTo("ADMIN", "MANAGER"),
    upload.single("image"),
    processProductImage,
    updateMenuItem,
  )
  .delete(protect, restrictTo("ADMIN", "MANAGER"), deleteMenuItem);

export default router;
