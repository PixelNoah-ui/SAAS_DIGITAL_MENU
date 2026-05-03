import express from "express";
import { protect } from "../controller/authController.js";
import { restrictTo } from "../middleware/restrictTo.js";
import { getDashboard } from "../controller/dashboardController.js";

const router = express.Router();

router.use(protect, restrictTo("ADMIN", "MANAGER"));

router.route("/").get(getDashboard);

export default router;
