import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { Prisma } from "../../../generated/prisma/client";
import { userService } from "./user.service";


const registerUser = async (req: Request, res: Response) => {
  try {
    const payload = req.body;

    const user = await userService.registerUserIntoDB(payload);

    res.status(httpStatus.CREATED).json({
      success: true,
      statusCode: httpStatus.CREATED,
      message: "User registered successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    console.log(error);

    const isDuplicateEmailError =
      error instanceof Error &&
      error.message === "User with this email already exists";

    const isPrismaDuplicateKeyError =
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002";

    const statusCode = isDuplicateEmailError || isPrismaDuplicateKeyError
      ? httpStatus.BAD_REQUEST
      : httpStatus.INTERNAL_SERVER_ERROR;

    res.status(statusCode).json({
      success: false,
      statusCode,
      message: isDuplicateEmailError
        ? "Email already in use. Please login or register with a different email."
        : isPrismaDuplicateKeyError
        ? "Duplicate value found. Please use a different email or phone number."
        : "Failed to register user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const getMyProfile = async (req: Request, res: Response, next : NextFunction) => {
  try {
    const profile = await userService.getMyProfileFromDB(
      req.user?.id as string,
    );


    res.status(httpStatus.OK).json({
      success: true,
      statusCode: httpStatus.OK,
      message: "User profile fetched successfully",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

export const userRegestration = {
  registerUser,
  getMyProfile,
};
