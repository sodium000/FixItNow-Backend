
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

const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, phone, experienceYrs, hourlyRate, address, city } = req.body;

    if (
      name === undefined &&
      phone === undefined &&
      experienceYrs === undefined &&
      hourlyRate === undefined &&
      address === undefined &&
      city === undefined
    ) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "At least one profile field is required to update",
      });
    }

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "name must be a non-empty string",
      });
    }

    if (phone !== undefined && typeof phone !== "string") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "phone must be a string",
      });
    }

    if (
      experienceYrs !== undefined &&
      (typeof experienceYrs !== "number" || experienceYrs < 0)
    ) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "experienceYrs must be a non-negative number",
      });
    }

    if (
      hourlyRate !== undefined &&
      (typeof hourlyRate !== "number" || hourlyRate < 0)
    ) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "hourlyRate must be a non-negative number",
      });
    }

    if (address !== undefined && typeof address !== "string") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "address must be a string",
      });
    }

    if (city !== undefined && typeof city !== "string") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "city must be a string",
      });
    }

    const updatedProfile = await tecnicianFilter.updateTechnicianProfile(
      req.user!.id,
      {
        name,
        phone,
        experienceYrs,
        hourlyRate,
        address,
        city,
      },
    );

    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician profile updated successfully",
      data: { profile: updatedProfile },
    });
  } catch (error) {
    next(error);
  }
};

const updateAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { isAvailable } = req.body;

    if (typeof isAvailable !== "boolean") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "isAvailable must be true or false",
      });
    }

    const updatedProfile = await tecnicianFilter.updateTechnicianAvailability(
      req.user!.id,
      { isAvailable },
    );

    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Technician availability updated successfully",
      data: { profile: updatedProfile },
    });
  } catch (error) {
    next(error);
  }
};

export const getTecnicians = {
  getAllTecnicians,
  getTechnicianById,
};

export const technicianSelf = {
  updateProfile,
  updateAvailability,
};
