import { Request, Response, Router } from "express";
import { userRegestration } from "./user.controller";


 const router = Router();

router.post("/register", userRegestration.registerUser )


export const userRoute = router


