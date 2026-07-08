import httpStatus from "http-status";
import { NextFunction, Request, Response } from "express";
import { prisma } from "../../lib/prisma";

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

export const getTecnicians = {
  getAllTecnicians,
};
