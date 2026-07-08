
import { NextFunction, Request, Response } from "express";
import { CategoryCreate } from "./createService.service";
import { prisma } from "../../lib/prisma";

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

const allCategory = async(req: Request, res: Response, next: NextFunction)=>{
    try {
        const AllCategory = await prisma.category.findMany()
          res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: {AllCategory},
        });
    } catch (error) {
        next(error)
    }
}

export const catagory = {
    NewCategory,
    allCategory
};