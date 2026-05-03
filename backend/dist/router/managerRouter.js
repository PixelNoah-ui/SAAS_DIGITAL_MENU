import express from "express";
import { protect } from "../controller/authController.js";
import { restrictTo } from "../middleware/restrictTo.js";
import { getManagers, getManager, createManager, updateManager, deleteManager, } from "../controller/managerController.js";
const router = express.Router();
router.use(protect, restrictTo("ADMIN"));
router.route("/").get(getManagers).post(createManager);
router.route("/:id").get(getManager).patch(updateManager).delete(deleteManager);
export default router;
//# sourceMappingURL=managerRouter.js.map