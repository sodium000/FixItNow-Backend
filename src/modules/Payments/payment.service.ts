import Stripe from "stripe";
import { BookingStatus, PaymentStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

const completePaymentForBooking = async (params: {
  bookingId: string;
  transactionId: string;
  amount: number;
}) => {
  const { bookingId, transactionId, amount } = params;

  await prisma.$transaction(async (tx) => {
    await tx.payment.upsert({
      where: {
        bookingId,
      },
      update: {
        transactionId,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
        amount,
      },
      create: {
        bookingId,
        transactionId,
        amount,
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
      },
    });

    await tx.booking.update({
      where: {
        id: bookingId,
      },
      data: {
        status: BookingStatus.ACCEPT,
      },
    });
  });
};

const createCheckoutSession = async (userId: string, bookingId: string) => {
  const paymentUrl = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const booking = await tx.booking.findUniqueOrThrow({
      where: { id: bookingId },
      include: {
        service: true,
        payment: true,
      },
    });

    if (booking.customerId !== userId) {
      throw new Error("This booking does not belong to the logged-in customer");
    }

    if (booking.payment?.status === PaymentStatus.COMPLETED) {
      throw new Error("Payment already completed for this booking");
    }

    const amount = Math.round(Number(booking.totalAmount) * 100);
    if (!amount || amount <= 0) {
      throw new Error("Invalid booking amount for payment");
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });

    const baseUrl = config.app_url || "http://localhost:5000";

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: (config.stripe_currency || "usd").toLowerCase(),
            product_data: {
              name: booking.service?.name || "FixItNow Booking Payment",
              description: `Booking payment for ${booking.id}`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer: customer.id,
      payment_method_types: ["card"],
      success_url: `${baseUrl}/api/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/api/payments/cancel`,
      metadata: { userId: user.id, bookingId: booking.id },
      payment_intent_data: {
        metadata: { userId: user.id, bookingId: booking.id },
      },
    });

    if (!session.url) {
      throw new Error("Failed to create Stripe checkout session");
    }

    return session.url;
  });

  return { paymentUrl };
};

const getMyPaymentsFromDB = async (userId: string) => {
  return prisma.payment.findMany({
    where: {
      status: PaymentStatus.COMPLETED,
      booking: {
        customerId: userId,
      },
    },
    include: {
      booking: {
        select: {
          id: true,
          totalAmount: true,
          status: true,
          service: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getPaymentDetailsFromDB = async (paymentId: string, userId: string) => {
  return prisma.payment.findFirstOrThrow({
    where: {
      id: paymentId,
      status: PaymentStatus.COMPLETED,
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
  });
};

const confirmPaymentFromCheckoutSession = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new Error("Payment is not completed yet.");
  }

  const bookingId = session.metadata?.bookingId;
  if (!bookingId) {
    throw new Error("Booking ID not found in checkout session.");
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  await completePaymentForBooking({
    bookingId,
    transactionId: paymentIntentId || session.id,
    amount: (session.amount_total ?? 0) / 100,
  });

  return {
    bookingId,
    sessionId: session.id,
    paymentStatus: session.payment_status,
    amount: (session.amount_total ?? 0) / 100,
  };
};

const handleWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_srcret;

  if (!endpointSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  if (!Buffer.isBuffer(payload)) {
    throw new Error(
      "Webhook payload is not raw. Ensure /api/payments/confirm is registered before express.json().",
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid webhook signature";
    console.error("Stripe webhook signature verification failed:", message);
    throw new Error(`Webhook signature verification failed: ${message}`);
  }

  console.log("Stripe event verified:", event.type, event.id);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status !== "paid") {
        break;
      }

      const bookingId = session.metadata?.bookingId;
      if (!bookingId) {
        console.log("checkout.session.completed: no bookingId in metadata");
        break;
      }

      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;

      await completePaymentForBooking({
        bookingId,
        transactionId: paymentIntentId || session.id,
        amount: (session.amount_total ?? 0) / 100,
      });

      break;
    }

    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const bookingId = paymentIntent.metadata?.bookingId;

      if (!bookingId) {
        console.log("payment_intent.succeeded: no bookingId in metadata");
        break;
      }

      await completePaymentForBooking({
        bookingId,
        transactionId: paymentIntent.id,
        amount: (paymentIntent.amount_received ?? 0) / 100,
      });

      break;
    }

    case "checkout.session.expired":
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.bookingId;

      if (!bookingId) {
        break;
      }

      await prisma.payment.updateMany({
        where: { bookingId },
        data: { status: PaymentStatus.FAILED },
      });

      break;
    }

    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
      break;
  }
};

export const paymentService = {
  createCheckoutSession,
  getMyPaymentsFromDB,
  getPaymentDetailsFromDB,
  confirmPaymentFromCheckoutSession,
  handleWebhook,
};
