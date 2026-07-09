import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { reviewService } from "./review.service";

const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const restrictedFields = [
      "id",
      "customerId",
      "technicianId",
      "createdAt",
      "updatedAt",
    ];
    const attemptedRestrictedField = restrictedFields.find(
      (field) => req.body[field] !== undefined,
    );

    if (attemptedRestrictedField) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: `${attemptedRestrictedField} cannot be set from this route`,
      });
    }

    const { bookingId, rating, comment } = req.body;

    if (!bookingId || typeof bookingId !== "string") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "bookingId is required and must be a string",
      });
    }

    if (rating === undefined || typeof rating !== "number") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "rating is required and must be a number between 1 and 5",
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "rating must be an integer between 1 and 5",
      });
    }

    if (comment !== undefined && typeof comment !== "string") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "comment must be a string",
      });
    }

    const result = await reviewService.createReviewIntoDB(req.user!.id, {
      bookingId,
      rating,
      comment,
    });

    res.status(httpStatus.CREATED).json({
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Review created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const reviewController = {
  createReview,
};

