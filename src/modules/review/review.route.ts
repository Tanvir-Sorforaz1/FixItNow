import { Router } from "express";
import auth from "../../middlewares/auth.js";
import reviewController from "./review.controller.js";

const router = Router();

router.post("/", auth, reviewController.create);

export default router;
