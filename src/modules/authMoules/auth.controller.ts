import { NextFunction, Request, Response } from "express";
import { authService } from "./auth.service";
import httpStatus from "http-status";

const loginUser = async (req: Request, res: Response, next : NextFunction ) => {
  const payload = req.body;

  try {
    const { accessToken, refreshToken } = await authService.loginUser(payload);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 day
    });

    res.send({
      success: true,
      statusCode: httpStatus.OK,
      message: "User logged in successfully",
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    next(error)
  }
};


const refreshToken = async (req : Request, res : Response,next : NextFunction) => {
   try {
        const oldRefreshToken = req.cookies.refreshToken;

        if (!oldRefreshToken) {
            const error = new Error("Refresh token is missing from cookies!");
            (error as any).statusCode = httpStatus.UNAUTHORIZED; 
            return next(error);
        }
        
        const { accessToken, newRefreshToken } = await authService.refreshToken(oldRefreshToken);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24 // 1 day
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });

        return res.status(httpStatus.OK).send({
            success: true,
            statusCode: httpStatus.OK,
            message: "Token Refreshed Successfully",
            data: { accessToken, refreshToken: newRefreshToken },
        });

    } catch (error) {
        next(error);
    }
};




export const authController = {
  loginUser,
  refreshToken
};
