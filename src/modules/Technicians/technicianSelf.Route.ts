import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { technicianSelf } from "./technicians.controller.js";

const router = Router();

router.put("/profile", auth(Role.TECHNICIAN,Role.ADMIN), technicianSelf.updateProfile);
router.put(
  "/availability",
  auth(Role.TECHNICIAN,Role.ADMIN),
  technicianSelf.updateAvailability,
);
router.patch(
  "/bookings/:id",
  auth(Role.TECHNICIAN),
  technicianSelf.updateBookingStatus,
);

export const technicianSelfRoute = router;
