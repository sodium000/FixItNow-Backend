import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { catagory } from "./createService.controller";


const router = Router()

router.post("/categories", auth(Role.ADMIN),catagory.NewCategory)
router.get("/categories", auth(Role.ADMIN),catagory.allCategory)


export const admin = router