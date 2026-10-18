import { PaymentMethod } from "../../../generated/prisma/enums.js";

export interface CreatePaymentIntentPayload {
  bookingId: string;
}

export interface ConfirmPaymentPayload {
  transactionId: string;
  method?: PaymentMethod;
}
