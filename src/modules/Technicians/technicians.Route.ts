import { Request, Response, Router } from "express";
import { getTecnicians } from "./technicians.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { bookingController } from "../Bookings/booking.controller";

 const router = Router();

router.get("/technicians", getTecnicians.getAllTecnicians );
router.get("/technicians/:id", getTecnicians.getTechnicianById );
router.get("/categories", getTecnicians.getTechnicianById );
router.get(
  "/technician/bookings",
  auth(Role.TECHNICIAN),
  bookingController.getMyBookings,
);


export const tecnicianFilter = router