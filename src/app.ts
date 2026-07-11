import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Application, type Request, type Response } from "express";
import authRoutes from "./modules/auth/auth.route.js";
import adminRoutes from "./modules/admin/admin.route.js";
import bookingRoutes from "./modules/booking/booking.route.js";
import categoryRoutes from "./modules/category/category.route.js";
import paymentRoutes from "./modules/payment/payment.route.js";
import reviewRoutes from "./modules/review/review.route.js";
import serviceRoutes from "./modules/service/service.route.js";
import subscriptionRoutes from "./modules/subscription/subscription.route.js";
import technicianRoutes from "./modules/technician/technician.route.js";
import userRoutes from "./modules/user/user.route.js";
import notFound from "./middlewares/notFound.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";

const app: Application = express();

app.use(cors());
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
    res.json({
        success: true,
        message: "FixItNow API is running",
    });
});

app.use("/api/subscription", subscriptionRoutes);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/technicians", technicianRoutes);
app.use("/api/technician", technicianRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;