import { Router } from "express";
import auth from "../../middlewares/auth.js";
import paymentController from "./payment.controller.js";

const router = Router();

router.post("/create", auth, paymentController.create);
router.post("/confirm", auth, paymentController.confirm);
router.get("/", auth, paymentController.getAll);
router.get("/:id", auth, paymentController.getById);

export default router;
