import { Router } from "express";
import { serviceController } from "./service.controller";

const router = Router();

router.get("/", serviceController.getAllServices);

export const serviceRoute = router;
