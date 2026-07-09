import { prisma } from "../../lib/prisma";
import {
  UpdateTechnicianAvailabilityPayload,
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

export const tecnicianFilter = {
  technicianById,
  updateTechnicianProfile,
  updateTechnicianAvailability,
};
