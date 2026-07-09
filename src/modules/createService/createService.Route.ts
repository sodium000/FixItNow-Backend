import { NextFunction, Request, Response, Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { catagory } from "./createService.controller";
import { prisma } from "../../lib/prisma";


const router = Router()

router.post("/categories", auth(Role.ADMIN),catagory.NewCategory);
router.get("/categories", auth(Role.ADMIN),catagory.allCategory);
router.get("/users", auth(Role.ADMIN),async(req: Request, res: Response, next: NextFunction)=>{
    try {
        const Alluser = await prisma.user.findMany({
            omit:{
                password : true
            }
        })
          res.status(201).json({
            success: true,
            message: "Get All User  successfully",
            data: {Alluser},
        });
    } catch (error) {
        next(error)
    }
});

router.post("/users/:id", auth(Role.ADMIN),catagory.UserUpdata)


export const admin = router