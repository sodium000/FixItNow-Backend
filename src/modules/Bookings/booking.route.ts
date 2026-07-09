import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { bookingController } from "./booking.controller";

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
