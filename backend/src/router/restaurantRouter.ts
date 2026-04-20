import express from "express";
import { protect } from "../controller/authController.js";
import { restrictTo } from "../middleware/restrictTo.js";
import { getRestaurantInfo } from "../controller/restaurantController.js";

const router = express.Router();

router.get("/", getRestaurantInfo);

router.use(protect, restrictTo("ADMIN", "MANAGER"));

export default router;
