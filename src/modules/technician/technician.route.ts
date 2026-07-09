import { Router } from "express";
import auth from "../../middlewares/auth.js";
import roleGuard from "../../middlewares/roleGuard.js";
import technicianController from "./technician.controller.js";

const router = Router();

router.get("/", technicianController.getAll);
router.get("/:id", technicianController.getById);
router.put("/profile", auth, roleGuard("TECHNICIAN"), technicianController.updateProfile);
router.put("/availability", auth, roleGuard("TECHNICIAN"), technicianController.updateAvailability);
router.get("/bookings", auth, roleGuard("TECHNICIAN"), technicianController.getBookings);
router.patch("/bookings/:id", auth, roleGuard("TECHNICIAN"), technicianController.updateBookingStatus);

export default router;
