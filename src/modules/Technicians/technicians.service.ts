import { BookingStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
  UpdateTechnicianAvailabilityPayload,
  UpdateTechnicianBookingStatusPayload,
  UpdateTechnicianProfilePayload,
} from "./technician.interface";

const technicianById = async (id: string) => {
  const technician = await prisma.technicianProfile.findFirstOrThrow({
    where: {
      id: id,
    },
    include: {
      user: true,
      reviewsReceived: {
        orderBy: {
          createdAt: "desc", // Sort reviews by newest first
        },
      },
    },
  });

  return technician;
};

const getTechnicianProfileByUserId = async (userId: string) => {
  const profile = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error("Technician profile not found");
  }

  return profile;
};

const updateTechnicianProfile = async (
  userId: string,
  payload: UpdateTechnicianProfilePayload,
) => {
  await getTechnicianProfileByUserId(userId);

  const { name, phone, experienceYrs, hourlyRate, address, city } = payload;

  if (name !== undefined || phone !== undefined) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
      },
    });
  }

  const updatedProfile = await prisma.technicianProfile.update({
    where: { userId },
    data: {
      ...(experienceYrs !== undefined && { experienceYrs }),
      ...(hourlyRate !== undefined && { hourlyRate }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
    },
    include: {
      user: {
        omit: {
          password: true,
        },
      },
    },
  });

  return updatedProfile;
};

const updateTechnicianAvailability = async (
  userId: string,
  payload: UpdateTechnicianAvailabilityPayload,
) => {
  const profile = await getTechnicianProfileByUserId(userId);

  if (payload.isAvailable === profile.isAvailable) {
    throw new Error("You have allready updated data");
  }

  const updatedProfile = await prisma.technicianProfile.update({
    where: { userId },
    data: {
      isAvailable: payload.isAvailable,
    },
    include: {
      user: {
        omit: {
          password: true,
        },
      },
    },
  });

  return updatedProfile;
};

const updateTechnicianBookingStatus = async (
  userId: string,
  bookingId: string,
  payload: UpdateTechnicianBookingStatusPayload,
) => {
  const technicianProfile = await getTechnicianProfileByUserId(userId);

  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      customer: {
        omit: {
          password: true,
        },
      },
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

  if (booking.technicianId !== technicianProfile.id) {
    throw new Error("You don't have permission to update this booking");
  }

  if (booking.status === payload.status) {
    throw new Error("You have allready updated data");
  }

  const allowedNextStatuses: Record<
    UpdateTechnicianBookingStatusPayload["status"],
    BookingStatus[]
  > = {
    ACCEPT: [BookingStatus.PENDING],
    DECLINE: [BookingStatus.PENDING, BookingStatus.ACCEPT],
    COMPLETED: [BookingStatus.ACCEPT, BookingStatus.IN_PROGRESS],
  };

  if (!allowedNextStatuses[payload.status].includes(booking.status)) {
    throw new Error(
      `Booking status cannot be changed from ${booking.status} to ${payload.status}`,
    );
  }

  const updatedBooking = await prisma.booking.update({
    where: {
      id: bookingId,
    },
    data: {
      status: payload.status,
    },
    include: {
      customer: {
        omit: {
          password: true,
        },
      },
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
      payment: true,
      review: true,
    },
  });

  return updatedBooking;
};

export const tecnicianFilter = {
  technicianById,
  updateTechnicianProfile,
  updateTechnicianAvailability,
  updateTechnicianBookingStatus,
};
