import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import config from "./config";
import { userRoute } from "./modules/userModules/user.Route";
import { notFound } from "./middlewares/notFound";
import { logUser } from "./modules/authMoules/auth.Route";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { tecnicianFilter } from "./modules/Technicians/technicians.Route";
import { technicianSelfRoute } from "./modules/Technicians/technicianSelf.Route";
import { admin } from "./modules/createService/createService.Route";
import { bookingRoute } from "./modules/Bookings/booking.route";
import { reviewRoute } from "./modules/Reviews/review.route";
import { serviceRoute } from "./modules/Services/service.route";
import { paymentRoute } from "./modules/Payments/payment.route";
import { stripe } from "./lib/stripe";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

const endpointSecret = config.stripe_webhook_srcret;

app.post(
  "/api/payments/confirm",
  express.raw({ type: "application/json" }),
  (request: Request, response: Response) => {
    let event = request.body;
    // Only verify the event if you have an endpoint secret defined.
    // Otherwise use the basic event deserialized with JSON.parse
    if (endpointSecret) {
      // Get the signature sent by Stripe
      const signature = request.headers["stripe-signature"]!;
      try {
        event = stripe.webhooks.constructEvent(
          request.body,
          signature,
          endpointSecret,
        );
      } catch (err: any) {
        console.log(`⚠️  Webhook signature verification failed.`, err.message);
        return response.sendStatus(400);
      }
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        console.log(
          `PaymentIntent for ${paymentIntent.amount} was successful!`,
        );
        // Then define and call a method to handle the successful payment intent.
        // handlePaymentIntentSucceeded(paymentIntent);
        break;
      case "payment_method.attached":
        const paymentMethod = event.data.object;
        // Then define and call a method to handle the successful attachment of a PaymentMethod.
        // handlePaymentMethodAttached(paymentMethod);
        break;
      default:
        // Unexpected event type
        console.log(`Unhandled event type ${event.type}.`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  },
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/auth", userRoute);
app.use("/api/authlogin", logUser);
app.use("/api", tecnicianFilter);
app.use("/api/technician", technicianSelfRoute);
app.use("/api/admin", admin);
app.use("/api/bookings", bookingRoute);
app.use("/api/reviews", reviewRoute);
app.use("/api/services", serviceRoute);
app.use("/api/payments", paymentRoute);

app.use(notFound);
app.use(globalErrorHandler);
export default app;
