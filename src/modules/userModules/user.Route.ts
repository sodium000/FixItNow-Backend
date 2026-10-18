import { Request, Response, Router } from "express";
import { userRegestration } from "./user.controller.js";
import { auth } from "../../middlewares/auth.js";
import { Role } from "../../../generated/prisma/enums.js";


 const router = Router();

router.post("/register", userRegestration.registerUser );
router.get("/me",auth(Role.ADMIN, Role.CUSTOMER, Role.TECHNICIAN), userRegestration.getMyProfile );


export const userRoute = router


