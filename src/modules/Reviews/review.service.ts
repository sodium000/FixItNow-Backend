import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { CreateReviewPayload } from "./review.interface";

const createReviewIntoDB = async (userId: string, payload: CreateReviewPayload) => {
  const { bookingId, rating, comment } = payload;

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      review: true,
      technician: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  if (booking.customerId !== userId) {
    throw new Error("You don't have permission to review this booking");
  }

  if (booking.status !== BookingStatus.COMPLETED) {
    throw new Error("You can only review a completed booking");
  }

  if (booking.review) {
    throw new Error("This booking already has a review");
  }

  const technician = booking.technician;

  const [review, updatedTechnician] = await prisma.$transaction([
    prisma.review.create({
      data: {
        bookingId: booking.id,
        customerId: userId,
        technicianId: booking.technicianId,
        rating,
        comment,
      },
    }),
    prisma.technicianProfile.update({
      where: {
        id: booking.technicianId,
      },
      data: {
        avgRating:
          ((technician.avgRating || 0) * technician.totalReviews + rating) /
          (technician.totalReviews + 1),
        totalReviews: technician.totalReviews + 1,
      },
    }),
  ]);

  return {
    review,
    technician: updatedTechnician,
  };
};

export const reviewService = {
  createReviewIntoDB,
};

