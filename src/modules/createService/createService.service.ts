import { prisma } from "../../lib/prisma";

import { Role } from "../../../generated/prisma/enums";

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  phone?: string | null;
  role?: Role;
  isActive?: boolean;
  photoUrl?: string | null;
}

interface Data {
  name: string;
  description?: string;
  services?: {
    name: string;
    price: number;
    technicianId: string;
    isActive?: boolean;
  }[];
}

interface UpdateCategoryPayload {
  name?: string;
  description?: string;
}

interface UpdateServicePayload {
  name?: string;
  price?: number;
  isActive?: boolean;
  categoryId?: string;
  technicianId?: string;
}

const createdCategory = async (payload: Data) => {
  const { name, description, services } = payload;

  const category = await prisma.category.create({
    data: {
      name,
      description,
      ...(services && services.length > 0
        ? {
            services: {
              create: services.map((service) => ({
                name: service.name,
                price: service.price,
                technicianId: service.technicianId,
                isActive: service.isActive ?? true,
              })),
            },
          }
        : {}),
    },
    include: {
      services: true,
    },
  });

  return category;
};

const updateUserInDB = async (id: string, payload: UpdateUserPayload) => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    throw new Error("User not found");
  }

  if (payload.email && payload.email !== user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: payload.email },
    });
    if (existingUser && existingUser.id !== id) {
      throw new Error("Email is already in use by another user");
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: payload,
    omit: {
      password: true,
    },
    include: {
      technicianProfile: true,
    },
  });

  return updatedUser;
};

// ─── Admin: Delete User ───────────────────────────────────────────────────────
const deleteUserFromDB = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User not found");

  await prisma.user.delete({ where: { id } });
  return { message: "User deleted successfully" };
};

// ─── Admin: Update Category ───────────────────────────────────────────────────
const updateCategoryInDB = async (id: string, payload: UpdateCategoryPayload) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new Error("Category not found");

  const updated = await prisma.category.update({
    where: { id },
    data: payload,
    include: { services: true },
  });

  return updated;
};

// ─── Admin: Delete Category ───────────────────────────────────────────────────
const deleteCategoryFromDB = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new Error("Category not found");

  await prisma.category.delete({ where: { id } });
  return { message: "Category deleted successfully" };
};

// ─── Admin: Update Service ────────────────────────────────────────────────────
const updateServiceInDB = async (id: string, payload: UpdateServicePayload) => {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw new Error("Service not found");

  const updated = await prisma.service.update({
    where: { id },
    data: payload,
    include: {
      category: true,
      technician: {
        include: {
          user: { omit: { password: true } },
        },
      },
    },
  });

  return updated;
};

// ─── Admin: Delete Service ────────────────────────────────────────────────────
const deleteServiceFromDB = async (id: string) => {
  const service = await prisma.service.findUnique({ where: { id } });
  if (!service) throw new Error("Service not found");

  await prisma.service.delete({ where: { id } });
  return { message: "Service deleted successfully" };
};

export const CategoryCreate = {
  createdCategory,
  updateUserInDB,
  updateUserStatus: updateUserInDB,
  deleteUserFromDB,
  updateCategoryInDB,
  deleteCategoryFromDB,
  updateServiceInDB,
  deleteServiceFromDB,
};
