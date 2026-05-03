import express from "express";
import {
  createOrReuseSession,
  getCurrentSession,
  closeSession,
} from "../controller/sessionController.js";
import { requireSession } from "../middleware/sessionMiddleware.js";

const router = express.Router();

// Public routes - create or reuse session
router.post("/", createOrReuseSession);

// Protected routes - require active session
router.use(requireSession);
router.get("/me", getCurrentSession);
router.delete("/", closeSession);

export default router;
