import { Router } from "express";
import auth from "../../middlewares/auth.js";
import roleGuard from "../../middlewares/roleGuard.js";
import categoryController from "./category.controller.js";

const router = Router();

router.get("/", categoryController.getAll);
router.post("/", auth, roleGuard("ADMIN"), categoryController.create);

export default router;
