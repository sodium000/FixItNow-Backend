import { Request, Response, Router } from "express";
import { userRegestration } from "./user.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";


 const router = Router();

router.post("/register", userRegestration.registerUser );
router.get("/me",auth(Role.ADMIN, Role.CUSTOMER, Role.TECHNICIAN), userRegestration.getMyProfile );


export const userRoute = router


