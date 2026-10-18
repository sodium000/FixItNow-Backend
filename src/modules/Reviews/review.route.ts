import { Router } from "express";
import { Role } from "../../../generated/prisma/enums.js";
import { auth } from "../../middlewares/auth.js";
import { reviewController } from "./review.controller.js";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  reviewController.createReview,
);

export const reviewRoute = router;

