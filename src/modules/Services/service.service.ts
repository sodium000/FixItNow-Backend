import { prisma } from "../../lib/prisma";
import { GetServicesQuery } from "./service.interface";

const getAllServicesFromDB = async (query: GetServicesQuery) => {
  const { type, location, rating } = query;
  const andConditions: any[] = [];

  if (type !== undefined) {
    andConditions.push({
      category: {
        name: {
          contains: type,
          mode: "insensitive",
        },
      },
    });
  }

  if (location !== undefined) {
    andConditions.push({
      technician: {
        OR: [
          {
            city: {
              contains: location,
              mode: "insensitive",
            },
          },
          {
            address: {
              contains: location,
              mode: "insensitive",
            },
          },
        ],
      },
    });
  }

  if (rating !== undefined) {
    andConditions.push({
      technician: {
        avgRating: {
          gte: rating,
        },
      },
    });
  }

  const services = await prisma.service.findMany({
    where: {
      isActive: true,
      ...(andConditions.length > 0 && {
        AND: andConditions,
      }),
    },
    include: {
      category: true,
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

  return services;
};

export const serviceService = {
  getAllServicesFromDB,
};
