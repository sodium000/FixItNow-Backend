import { Router } from "express";
import { forgotPass } from "./forgotPassword.controller";




const router = Router()


router.post("/",forgotPass);

export const  PasswordForgote = router
