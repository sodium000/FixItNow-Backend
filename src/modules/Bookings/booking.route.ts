import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { bookingController } from "./booking.controller.js";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  bookingController.createBooking,
);

router.get(
  "/",
  auth(Role.CUSTOMER),
  bookingController.getMyBookings,
);

router.get(
  "/:id",
  auth(Role.CUSTOMER, Role.TECHNICIAN),
  bookingController.getBookingById,
);

export const bookingRoute = router;
