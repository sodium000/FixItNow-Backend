import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { paymentController } from "./payment.controller.js";

const router = Router();

router.post(
  "/checkout",
  auth(Role.ADMIN, Role.CUSTOMER, Role.TECHNICIAN),
  paymentController.createCheckoutSession,
);

router.get("/success", paymentController.confirmPaymentSuccess);

router.get("/cancel", (_req, res) => {
  res.status(200).json({
    success: false,
    message: "Payment was cancelled",
    data: null,
  });
});

router.get(
  "/",
  auth(Role.CUSTOMER),
  paymentController.getMyPayments,
);

router.get(
  "/:id",
  auth(Role.CUSTOMER),
  paymentController.getPaymentById,
);

export const paymentRoute = router;
