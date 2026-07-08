import { prisma } from "../../lib/prisma";

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

export const tecnicianFilter = {
  technicianById,
};
