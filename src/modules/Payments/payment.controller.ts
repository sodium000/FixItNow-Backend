import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { PaymentMethod } from "../../../generated/prisma/enums";
import { paymentService } from "./payment.service";

const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const restrictedFields = [
      "id",
      "transactionId",
      "amount",
      "status",
      "provider",
      "paidAt",
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

    const { bookingId } = req.body;

    if (!bookingId || typeof bookingId !== "string") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "bookingId is required and must be a string",
      });
    }

    const result = await paymentService.createPaymentIntentIntoDB(
      req.user!.id,
      { bookingId },
    );

    res.status(httpStatus.CREATED).json({
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Payment intent created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const confirmPayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const restrictedFields = ["id", "amount", "status", "provider", "paidAt"];
    const attemptedRestrictedField = restrictedFields.find(
      (field) => req.body[field] !== undefined,
    );

    if (attemptedRestrictedField) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: `${attemptedRestrictedField} cannot be set from this route`,
      });
    }

    const { transactionId, method } = req.body;

    if (!transactionId || typeof transactionId !== "string") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "transactionId is required and must be a string",
      });
    }

    if (
      method !== undefined &&
      !Object.values(PaymentMethod).includes(method as PaymentMethod)
    ) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "method must be one of CARD, MOBILE_BANKING, or CASH",
      });
    }

    const result = await paymentService.confirmPaymentIntoDB(req.user!.id, {
      transactionId,
      ...(method !== undefined && { method }),
    });

    const isCompleted = result.payment.status === "COMPLETED";
    const isFailed = result.payment.status === "FAILED";

    res.status(httpStatus.OK).json({
      success: isCompleted,
      statusCode: httpStatus.OK,
      message: isCompleted
        ? "Payment confirmed successfully"
        : isFailed
          ? "Payment verification failed"
          : "Payment verification is pending",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getMyPayments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payments = await paymentService.getMyPaymentsFromDB(req.user!.id);

    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment history fetched successfully",
      data: { payments },
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const payment = await paymentService.getPaymentDetailsFromDB(
      id as string,
      req.user!.id,
    );

    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment details fetched successfully",
      data: payment,
    });
  } catch (error) {
    next(error);
  }
};

export const paymentController = {
  createPaymentIntent,
  confirmPayment,
  getMyPayments,
  getPaymentById,
};
