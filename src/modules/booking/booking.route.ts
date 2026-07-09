import { Router } from "express";
import auth from "../../middlewares/auth.js";
import bookingController from "./booking.controller.js";

const router = Router();

router.post("/", auth, bookingController.create);
router.get("/", auth, bookingController.getAll);
router.get("/:id", auth, bookingController.getById);
router.patch("/:id/cancel", auth, bookingController.cancel);

export default router;
