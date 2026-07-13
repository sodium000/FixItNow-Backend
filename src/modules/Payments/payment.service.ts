import { PaymentStatus } from "../../../generated/prisma/enums";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

const createPaymentIntentIntoDB = async (userId: string, bookingId: string) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });

    const booking = await tx.booking.findUniqueOrThrow({
      where: {
        id: bookingId,
      },
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

    const lineItem = {
      price_data: {
        currency: (config.stripe_currency || "usd").toLowerCase(),
        product_data: {
          name: booking.service?.name || "FixItNow Booking Payment",
          description: `Booking payment for ${booking.id}`,
        },
        unit_amount: amount,
      },
      quantity: 1,
    };

    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id },
    });
    const stripeCustomerId = customer.id;

    const session = await stripe.checkout.sessions.create({
      line_items: [lineItem],
      mode: "payment",
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      success_url: `${config.app_url}/payment?success=true`,
      cancel_url: `${config.app_url}/payment?success=false`,
      metadata: { userId: user.id, bookingId: booking.id },
    });

    return session.url;
  });
  return {
    paymentUrl: transactionResult,
  };
};

export const paymentService = {
  createPaymentIntentIntoDB,
};
