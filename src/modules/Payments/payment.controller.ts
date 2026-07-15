import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { paymentService } from "./payment.service";

const createCheckoutSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.id;
    const { bookingId } = req.body;

    if (!bookingId || typeof bookingId !== "string") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "bookingId is required and must be a string",
      });
    }

    const result = await paymentService.createCheckoutSession(
      userId as string,
      bookingId,
    );

    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Checkout session created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const confirmPaymentSuccess = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sessionId = req.query.session_id as string | undefined;

    if (!sessionId) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "session_id is required",
      });
    }

    const result = await paymentService.confirmPaymentFromCheckoutSession(
      sessionId,
    );

    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Payment completed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const confirmPaymentWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("Stripe webhook received at /api/payments/confirm");

    const payload = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(
          typeof req.body === "string"
            ? req.body
            : JSON.stringify(req.body ?? {}),
        );

    const signature = Array.isArray(req.headers["stripe-signature"])
      ? req.headers["stripe-signature"][0]
      : req.headers["stripe-signature"] || req.get("stripe-signature");

    if (!signature || typeof signature !== "string") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message:
          "Missing stripe-signature header. Make sure the request is coming from Stripe or Stripe CLI and is sent to /api/payments/confirm.",
      });
    }

    await paymentService.handleWebhook(payload, signature);

    res.status(httpStatus.OK).send();
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Webhook signature verification failed")
    ) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }

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
  createCheckoutSession,
  confirmPaymentSuccess,
  confirmPaymentWebhook,
  getMyPayments,
  getPaymentById,
};
