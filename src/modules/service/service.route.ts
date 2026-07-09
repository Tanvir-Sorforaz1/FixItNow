import { Router } from "express";
import auth from "../../middlewares/auth.js";
import roleGuard from "../../middlewares/roleGuard.js";
import serviceController from "./service.controller.js";

const router = Router();

router.get("/", serviceController.getAll);
router.get("/:id", serviceController.getById);
router.post("/", auth, roleGuard("TECHNICIAN", "ADMIN"), serviceController.create);
router.patch("/:id", auth, roleGuard("TECHNICIAN", "ADMIN"), serviceController.update);

export default router;
