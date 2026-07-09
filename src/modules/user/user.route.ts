import { Router } from "express";
import auth from "../../middlewares/auth.js";
import userController from "./user.controller.js";

const router = Router();

router.get("/me", auth, userController.getMe);
router.patch("/me", auth, userController.updateMe);

export default router;
