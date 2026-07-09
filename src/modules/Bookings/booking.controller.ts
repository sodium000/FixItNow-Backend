import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { bookingService } from "./booking.service";

const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const restrictedFields = [
      "id",
      "customerId",
      "technicianId",
      "totalAmount",
      "status",
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

    const { serviceId, scheduledAt, address, notes } = req.body;

    if (!serviceId || typeof serviceId !== "string") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "serviceId is required and must be a string",
      });
    }

    if (!scheduledAt || typeof scheduledAt !== "string") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "scheduledAt is required and must be a valid datetime string",
      });
    }

    const parsedScheduledAt = new Date(scheduledAt);

    if (Number.isNaN(parsedScheduledAt.getTime())) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "scheduledAt must be a valid datetime string",
      });
    }

    if (parsedScheduledAt.getTime() <= Date.now()) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "scheduledAt must be a future date and time",
      });
    }

    if (!address || typeof address !== "string" || !address.trim()) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "address is required and must be a non-empty string",
      });
    }

    if (notes !== undefined && typeof notes !== "string") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "notes must be a string",
      });
    }

    const booking = await bookingService.createBookingIntoDB(req.user!.id, {
      serviceId,
      scheduledAt: parsedScheduledAt,
      address: address.trim(),
      ...(notes !== undefined && { notes }),
    });

    res.status(httpStatus.CREATED).json({
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Booking created successfully",
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const bookings = await bookingService.getMyBookingsFromDB(
      req.user!.id,
      req.user!.role,
    );

    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Bookings fetched successfully",
      data: { bookings },
    });
  } catch (error) {
    next(error);
  }
};

const getBookingById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const booking = await bookingService.getBookingDetailsFromDB(
      id as string,
      req.user!.id,
      req.user!.role,
    );

    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Booking details fetched successfully",
      data: { booking },
    });
  } catch (error) {
    next(error);
  }
};

export const bookingController = {
  createBooking,
  getMyBookings,
  getBookingById,
};
