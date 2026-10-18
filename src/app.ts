import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config/index.js";
import { userRoute } from "./modules/userModules/user.Route.js";
import { notFound } from "./middlewares/notFound.js";
import { logUser } from "./modules/authMoules/auth.Route.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import { tecnicianFilter } from "./modules/Technicians/technicians.Route.js";
import { technicianSelfRoute } from "./modules/Technicians/technicianSelf.Route.js";
import { admin } from "./modules/createService/createService.Route.js";
import { bookingRoute } from "./modules/Bookings/booking.route.js";
import { reviewRoute } from "./modules/Reviews/review.route.js";
import { serviceRoute } from "./modules/Services/service.route.js";
import { paymentRoute } from "./modules/Payments/payment.route.js";
import { paymentController } from "./modules/Payments/payment.controller.js";
import { PasswordForgote } from "./modules/forgot_Password/forgotPassword.route.js";


const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

// Stripe webhooks need the raw body — this route must be registered before express.json()
app.post(
  "/api/payments/confirm",
  express.raw({ type: "application/json" }),
  paymentController.confirmPaymentWebhook,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/auth", userRoute);
app.use("/api/authlogin", logUser);
app.use("/api", tecnicianFilter);
app.use("/api/technician", technicianSelfRoute);
app.use("/api/admin", admin);
app.use("/api/bookings", bookingRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/services", serviceRoute);
app.use("/api/payments", paymentRoute);

app.use("/otp", PasswordForgote);

app.use(notFound);
app.use(globalErrorHandler);
export default app;
