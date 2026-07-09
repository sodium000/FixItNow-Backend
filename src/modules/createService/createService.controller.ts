import { NextFunction, Request, Response } from "express";
import { CategoryCreate } from "./createService.service";
import { prisma } from "../../lib/prisma";
import httpStatus from "http-status";

const NewCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categoryData = req.body;

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
    const AllCategory = await prisma.category.findMany();
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
