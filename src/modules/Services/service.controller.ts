import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { serviceService } from "./service.service";

const getAllServices = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { type, location, rating } = req.query;

    if (type !== undefined && typeof type !== "string") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "type must be a string",
      });
    }

    if (location !== undefined && typeof location !== "string") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "location must be a string",
      });
    }

    let parsedRating: number | undefined;

    if (rating !== undefined) {
      if (typeof rating !== "string") {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "rating must be a number",
        });
      }

      parsedRating = Number(rating);

      if (Number.isNaN(parsedRating) || parsedRating < 0 || parsedRating > 5) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "rating must be a number between 0 and 5",
        });
      }
    }

    const services = await serviceService.getAllServicesFromDB({
      ...(type !== undefined && { type: type.trim() }),
      ...(location !== undefined && { location: location.trim() }),
      ...(parsedRating !== undefined && { rating: parsedRating }),
    });

    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Services fetched successfully",
      data: { services },
    });
  } catch (error) {
    next(error);
  }
};

export const serviceController = {
  getAllServices,
};
