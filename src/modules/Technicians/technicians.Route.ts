import { NextFunction, Request, Response, Router } from "express";
import { getTecnicians } from "./technicians.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { bookingController } from "../Bookings/booking.controller";
import { prisma } from "../../lib/prisma";

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


router.get(
  "/technician/bookings",
  auth(Role.TECHNICIAN),
  bookingController.getMyBookings,
);


export const tecnicianFilter = router