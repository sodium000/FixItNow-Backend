import Stripe from "stripe";
import {
  BookingStatus,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import {
  ConfirmPaymentPayload,
  CreatePaymentIntentPayload,
} from "./payment.interface";

const stripeSecretKey = config.stripe_secret_key;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not configured");
}

const stripe = new Stripe(stripeSecretKey);

const getCurrency = () => (config.stripe_currency || "usd").toLowerCase();

const toSmallestUnit = (amount: number) => Math.round(amount * 100);

const toLocalPaymentStatus = (
  stripeStatus: Stripe.PaymentIntent.Status,
): PaymentStatus => {
  if (stripeStatus === "succeeded") {
    return PaymentStatus.COMPLETED;
  }

  if (stripeStatus === "canceled") {
    return PaymentStatus.FAILED;
  }

  return PaymentStatus.PENDING;
};

const buildStripeSummary = (paymentIntent: Stripe.PaymentIntent) => ({
  id: paymentIntent.id,
  amount: paymentIntent.amount,
  currency: paymentIntent.currency,
  status: paymentIntent.status,
});

const buildPaymentSummary = (payment: any) => ({
  id: payment.id,
  transactionId: payment.transactionId,
  bookingId: payment.bookingId,
  amount: payment.amount,
  method: payment.method,
  provider: payment.provider,
  status: payment.status,
  paidAt: payment.paidAt,
  createdAt: payment.createdAt,
  updatedAt: payment.updatedAt,
  booking: payment.booking
    ? {
        id: payment.booking.id,
        status: payment.booking.status,
        scheduledAt: payment.booking.scheduledAt,
        address: payment.booking.address,
        totalAmount: payment.booking.totalAmount,
        service: payment.booking.service
          ? {
              id: payment.booking.service.id,
              name: payment.booking.service.name,
              price: payment.booking.service.price,
            }
          : undefined,
      }
    : undefined,
});

const createPaymentIntentIntoDB = async (
  userId: string,
  payload: CreatePaymentIntentPayload,
) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: payload.bookingId,
    },
    include: {
      payment: true,
      service: true,
      technician: {
        include: {
          user: {
            omit: {
              password: true,
            },
          },
        },
      },
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.customerId !== userId) {
    throw new Error("You don't have permission to pay for this booking");
  }

  if (booking.status !== BookingStatus.ACCEPT) {
    throw new Error("Payment can only be created for an accepted booking");
  }

  if (booking.payment?.status === PaymentStatus.COMPLETED) {
    throw new Error("Payment already completed for this booking");
  }

  const amount = Number(booking.totalAmount);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: toSmallestUnit(amount),
    currency: getCurrency(),
    metadata: {
      bookingId: booking.id,
      customerId: booking.customerId,
      technicianId: booking.technicianId,
    },
  });

  const payment = booking.payment
    ? await prisma.payment.update({
        where: {
          bookingId: booking.id,
        },
        data: {
          transactionId: paymentIntent.id,
          amount,
          provider: PaymentProvider.STRIPE,
          status: PaymentStatus.PENDING,
          method: PaymentMethod.CARD,
          paidAt: null,
        },
      })
    : await prisma.payment.create({
        data: {
          bookingId: booking.id,
          transactionId: paymentIntent.id,
          amount,
          provider: PaymentProvider.STRIPE,
          status: PaymentStatus.PENDING,
          method: PaymentMethod.CARD,
        },
      });

  return {
    payment: buildPaymentSummary({
      ...payment,
      booking: {
        id: booking.id,
        status: booking.status,
        scheduledAt: booking.scheduledAt,
        address: booking.address,
        totalAmount: booking.totalAmount,
        service: {
          id: booking.service.id,
          name: booking.service.name,
          price: booking.service.price,
        },
      },
    }),
    stripe: buildStripeSummary(paymentIntent),
  };
};

const confirmPaymentIntoDB = async (
  userId: string,
  payload: ConfirmPaymentPayload,
) => {
  const payment = await prisma.payment.findUnique({
    where: {
      transactionId: payload.transactionId,
    },
    include: {
      booking: {
        include: {
          service: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.booking.customerId !== userId) {
    throw new Error("You don't have permission to confirm this payment");
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(
    payload.transactionId,
  );

  const paymentStatus = toLocalPaymentStatus(paymentIntent.status);

  const updatedPayment = await prisma.payment.update({
    where: {
      transactionId: payload.transactionId,
    },
    data: {
      status: paymentStatus,
      method: payload.method || PaymentMethod.CARD,
      paidAt: paymentStatus === PaymentStatus.COMPLETED ? new Date() : null,
    },
    include: {
      booking: {
        include: {
          service: true,
        },
      },
    },
  });

  return {
    payment: buildPaymentSummary(updatedPayment),
    stripe: buildStripeSummary(paymentIntent),
  };
};

const getMyPaymentsFromDB = async (userId: string) => {
  const payments = await prisma.payment.findMany({
    where: {
      booking: {
        customerId: userId,
      },
    },
    include: {
      booking: {
        include: {
          service: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments.map((payment) => buildPaymentSummary(payment));
};

const getPaymentDetailsFromDB = async (paymentId: string, userId: string) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },
    include: {
      booking: {
        include: {
          service: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  if (payment.booking.customerId !== userId) {
    throw new Error("You don't have permission to access this payment");
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(
    payment.transactionId,
  );

  return {
    payment: buildPaymentSummary(payment),
    stripe: buildStripeSummary(paymentIntent),
  };
};

export const paymentService = {
  createPaymentIntentIntoDB,
  confirmPaymentIntoDB,
  getMyPaymentsFromDB,
  getPaymentDetailsFromDB,
};
