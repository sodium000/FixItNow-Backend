import { PaymentMethod } from "../../../generated/prisma/enums";

export interface CreatePaymentIntentPayload {
  bookingId: string;
}

export interface ConfirmPaymentPayload {
  transactionId: string;
  method?: PaymentMethod;
}
