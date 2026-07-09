import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middlewares/auth";
import { technicianSelf } from "./technicians.controller";

const router = Router();

router.put("/profile", auth(Role.TECHNICIAN), technicianSelf.updateProfile);
router.put(
  "/availability",
  auth(Role.TECHNICIAN),
  technicianSelf.updateAvailability,
);

export const technicianSelfRoute = router;
