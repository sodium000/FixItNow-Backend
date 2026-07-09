import { BookingStatus, Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { CreateBookingPayload } from "./booking.interface";

const createBookingIntoDB = async (
  userId: string,
  payload: CreateBookingPayload,
) => {
  const { serviceId, scheduledAt, address, notes } = payload;

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      technician: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!service) {
    throw new Error("Service not found");
  }

  if (!service.isActive) {
    throw new Error("Service is not available for booking");
  }

  if (!service.technician.isAvailable) {
    throw new Error("Technician is not available right now");
  }

  if (!service.technician.user.isActive) {
    throw new Error("Technician account is not active");
  }

  const existingBooking = await prisma.booking.findFirst({
    where: {
      technicianId: service.technicianId,
      scheduledAt,
      status: {
        in: [
          BookingStatus.PENDING,
          BookingStatus.ACCEPT,
          BookingStatus.IN_PROGRESS,
        ],
      },
    },
  });

  if (existingBooking) {
    throw new Error("This booking slot is already taken");
  }

  const booking = await prisma.booking.create({
    data: {
      customerId: userId,
      technicianId: service.technicianId,
      serviceId,
      scheduledAt,
      address,
      notes,
      totalAmount: service.price,
    },
    include: {
      customer: {
        omit: {
          password: true,
        },
      },
      technician: {
        include: {
          user: {
            omit: {
              password: true,
            },
          },
        },
      },
      service: true,
    },
  });

  return booking;
};

const getMyBookingsFromDB = async (userId: string, role: Role) => {
  if (role === Role.CUSTOMER) {
    return prisma.booking.findMany({
      where: {
        customerId: userId,
      },
      include: {
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
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  if (role === Role.TECHNICIAN) {
    return prisma.booking.findMany({
      where: {
        technician: {
          userId,
        },
      },
      include: {
        service: true,
        customer: {
          omit: {
            password: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  throw new Error("You don't have permission to view bookings");
};

const getBookingDetailsFromDB = async (
  bookingId: string,
  userId: string,
  role: Role,
) => {
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
      technician: {
        include: {
          user: {
            omit: {
              password: true,
            },
          },
        },
      },
      service: true,
      payment: true,
      review: true,
    },
  });

  if (!booking) {
    throw new Error("Booking not found");
  }

  const isCustomerOwner = booking.customerId === userId;
  const isTechnicianOwner = booking.technician.userId === userId;
  const isAdmin = role === Role.ADMIN;

  if (!isCustomerOwner && !isTechnicianOwner && !isAdmin) {
    throw new Error("You don't have permission to access this booking");
  }

  return booking;
};

export const bookingService = {
  createBookingIntoDB,
  getMyBookingsFromDB,
  getBookingDetailsFromDB,
};
