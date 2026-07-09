import { NextFunction, Request, Response } from "express";
import { CategoryCreate } from "./createService.service";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";

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
          (service.isActive !== undefined && typeof service.isActive !== "boolean"),
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

    res.status(201).json({
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
    res.status(201).json({
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
    const { isActive } = req.body;
    const { id } = req.params;


    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        message: "isActive must be true or false",
      });
    }

    const userupdate = await CategoryCreate.updateUserStatus(isActive, id as string);

    res.status(200).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "User status updated successfully",
      data: { userupdate },
    });
  } catch (error) {
    next(error);
  }
};

export const catagory = {
  NewCategory,
  allCategory,
  UserUpdata,
};
