import { NextFunction, Request, Response } from "express";
import { CategoryCreate } from "./createService.service";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";
import { Role } from "../../../generated/prisma/enums";

const NewCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryData = req.body;

    if (typeof categoryData.name !== "string" || !categoryData.name.trim()) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "name is required and must be a non-empty string",
      });
    }

    if (
      categoryData.description !== undefined &&
      typeof categoryData.description !== "string"
    ) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "description must be a string",
      });
    }

    if (
      categoryData.services !== undefined &&
      !Array.isArray(categoryData.services)
    ) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "services must be an array",
      });
    }

    if (Array.isArray(categoryData.services)) {
      const invalidService = categoryData.services.find(
        (service: any) =>
          !service ||
          typeof service.name !== "string" ||
          !service.name.trim() ||
          typeof service.price !== "number" ||
          service.price < 0 ||
          typeof service.technicianId !== "string" ||
          !service.technicianId.trim() ||
          (service.isActive !== undefined &&
            typeof service.isActive !== "boolean"),
      );

      if (invalidService) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message:
            "each service must include name, price, technicianId and optional isActive",
        });
      }
    }

    const newCategory = await CategoryCreate.createdCategory(categoryData);

    res.status(httpStatus.CREATED).json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

const allCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const AllCategory = await prisma.category.findMany({
      include: {
        services: true,
      },
    });
    res.status(httpStatus.OK).json({
      success: true,
      message: "Get All Category successfully",
      data: { AllCategory },
    });
  } catch (error) {
    next(error);
  }
};

const UserUpdata = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, isActive, photoUrl } = req.body;

    const payload: Record<string, any> = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "name must be a non-empty string",
        });
      }
      payload.name = name.trim();
    }

    if (email !== undefined) {
      if (typeof email !== "string" || !email.trim()) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "email must be a valid non-empty string",
        });
      }
      payload.email = email.trim();
    }

    if (phone !== undefined) {
      if (phone !== null && typeof phone !== "string") {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "phone must be a string or null",
        });
      }
      payload.phone = phone;
    }

    if (role !== undefined) {
      if (!Object.values(Role).includes(role)) {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: `role must be one of ${Object.values(Role).join(", ")}`,
        });
      }
      payload.role = role;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "isActive must be true or false",
        });
      }
      payload.isActive = isActive;
    }

    if (photoUrl !== undefined) {
      if (photoUrl !== null && typeof photoUrl !== "string") {
        return res.status(httpStatus.BAD_REQUEST).json({
          success: false,
          message: "photoUrl must be a string or null",
        });
      }
      payload.photoUrl = photoUrl;
    }

    if (Object.keys(payload).length === 0) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "At least one field to update must be provided",
      });
    }

    const userupdate = await CategoryCreate.updateUserInDB(
      id as string,
      payload,
    );

    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "User updated successfully",
      data: { userupdate },
    });
  } catch (error: any) {
    if (error?.message === "User not found") {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }
    if (error?.message === "Email is already in use by another user") {
      return res.status(httpStatus.CONFLICT).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// ─── Admin: Delete User ───────────────────────────────────────────────────────
const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await CategoryCreate.deleteUserFromDB(id as string);
    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "User deleted successfully",
      data: result,
    });
  } catch (error: any) {
    if (error?.message === "User not found") {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }
    next(error);
  }
};

// ─── Admin: Update Category ───────────────────────────────────────────────────
const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    if (!id || typeof id !== "string") {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "Invalid or missing category id",
      });
    }
    const payload = req.body;

    if (
      payload.name !== undefined &&
      (typeof payload.name !== "string" || !payload.name.trim())
    ) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "name must be a non-empty string",
      });
    }

    if (
      payload.description !== undefined &&
      typeof payload.description !== "string"
    ) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "description must be a string",
      });
    }

    const updated = await CategoryCreate.updateCategoryInDB(id, payload);

    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Category updated successfully",
      data: updated,
    });
  } catch (error: any) {
    if (error?.message === "Category not found") {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Category not found",
      });
    }
    next(error);
  }
};

// ─── Admin: Delete Category ───────────────────────────────────────────────────
const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await CategoryCreate.deleteCategoryFromDB(id as string);
    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Category deleted successfully",
      data: result,
    });
  } catch (error: any) {
    if (error?.message === "Category not found") {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Category not found",
      });
    }
    next(error);
  }
};

// ─── Admin: Update Service ────────────────────────────────────────────────────
const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const payload = req.body;

    if (
      payload.name !== undefined &&
      (typeof payload.name !== "string" || !payload.name.trim())
    ) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "name must be a non-empty string",
      });
    }

    if (
      payload.price !== undefined &&
      (typeof payload.price !== "number" || payload.price < 0)
    ) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "price must be a non-negative number",
      });
    }

    if (
      payload.isActive !== undefined &&
      typeof payload.isActive !== "boolean"
    ) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: "isActive must be a boolean",
      });
    }

    const updated = await CategoryCreate.updateServiceInDB(
      id as string,
      payload,
    );

    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Service updated successfully",
      data: updated,
    });
  } catch (error: any) {
    if (error?.message === "Service not found") {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Service not found",
      });
    }
    next(error);
  }
};

// ─── Admin: Delete Service ────────────────────────────────────────────────────
const deleteService = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const result = await CategoryCreate.deleteServiceFromDB(id as string);
    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "Service deleted successfully",
      data: result,
    });
  } catch (error: any) {
    if (error?.message === "Service not found") {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: "Service not found",
      });
    }
    next(error);
  }
};

export const catagory = {
  NewCategory,
  allCategory,
  UserUpdata,
  deleteUser,
  updateCategory,
  deleteCategory,
  updateService,
  deleteService,
};
