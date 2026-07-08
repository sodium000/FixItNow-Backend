
import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { tecnicianFilter } from "./technicians.service";


const getAllTecnicians = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "TECHNICIAN",
        isActive: true,
      },
       omit: {
    password: true,
  },
  include:{
    technicianProfile : true
  }
    });
    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "User profile fetched successfully",
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};


const getTechnicianById = async(req:Request,res:Response,next:NextFunction)=>{

  try {
    const { id } = req.params;
    const tecnicianById = await tecnicianFilter.technicianById(id as string)


    if(tecnicianById.user.isActive === false){
     throw new Error("User is blocked! Please contact our service center")
    }

    
    if (!tecnicianById) {
      return res.status(404).json({
        success: false,
        message: "Technician not found",
      });
    }

      res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "User profile fetched successfully",
      data: { tecnicianById },
    });

  } catch (error) {
    next(error)
  }



}

export const getTecnicians = {
  getAllTecnicians,
  getTechnicianById 
};
