import express from "express";
import {
  signup,
  login,
  logout,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
  getMe,
} from "../controller/authController.js";
import { restrictTo } from "../middleware/restrictTo.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/forgotPassword", forgotPassword);

router.patch("/resetPassword/:token", resetPassword);
router.use(protect);
router.get("/me", getMe);
router.use(restrictTo("ADMIN", "MANAGER"));
router.patch("/updatePassword", protect, updatePassword);

export default router;
