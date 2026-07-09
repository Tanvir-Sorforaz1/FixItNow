import { Router } from "express";
import auth from "../../middlewares/auth.js";
import roleGuard from "../../middlewares/roleGuard.js";
import adminController from "./admin.controller.js";

const router = Router();

router.get("/users", auth, roleGuard("ADMIN"), adminController.getUsers);
router.patch("/users/:id", auth, roleGuard("ADMIN"), adminController.updateUserStatus);
router.get("/bookings", auth, roleGuard("ADMIN"), adminController.getBookings);
router.get("/categories", auth, roleGuard("ADMIN"), adminController.getCategories);
router.post("/categories", auth, roleGuard("ADMIN"), adminController.createCategory);

export default router;
