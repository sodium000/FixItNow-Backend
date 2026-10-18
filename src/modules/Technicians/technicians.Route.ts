import { NextFunction, Request, Response, Router } from "express";
import { getTecnicians } from "./technicians.controller.js";
import { auth } from "../../middlewares/auth.js";
import { Role } from "../../../generated/prisma/enums.js";
import { bookingController } from "../Bookings/booking.controller.js";
import { prisma } from "../../lib/prisma.js";

 const router = Router();

router.get("/technicians", getTecnicians.getAllTecnicians );
router.get("/technicians/:id", getTecnicians.getTechnicianById );


router.get("/allservice", async(req: Request, res: Response, next: NextFunction)=>{
    try {
        const Allservice = await prisma.service.findMany({
        })
          res.status(200).json({
            success: true,
            message: "Get All service successfully",
            data: {Allservice},
        });
    } catch (error) {
        next(error)
    }
}); 

router.get("/categories", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const AllCategory = await prisma.category.findMany({
            include: {
                services: true,
            },
        });
        res.status(200).json({
            success: true,
            message: "Get All Category successfully",
            data: { AllCategory },
        });
    } catch (error) {
        next(error);
    }
}); 


router.get(
  "/technician/bookings",
  auth(Role.TECHNICIAN),
  bookingController.getMyBookings,
);


export const tecnicianFilter = router