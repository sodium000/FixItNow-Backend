import { Request, Response } from "express";
import { authService } from "./auth.service";
import httpStatus from "http-status";

const loginUser = async (req: Request, res: Response) => {
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

  }
};


const refreshToken = async (req : Request, res : Response) => {
    const oldRefreshToken = req.cookies.refreshToken;
    
    if (!oldRefreshToken) {
        throw new Error("Refresh token is missing from cookies!");
    }
    const {accessToken,newRefreshToken} = await authService.refreshToken(oldRefreshToken);

    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24 // 24 hour or 1 day
    });

      res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 day
    });


      res.send({
      success: true,
      statusCode: httpStatus.OK,
      message: "Token Refreshed Successfully",
      data: { accessToken, refreshToken: newRefreshToken },
    });
};




export const authController = {
  loginUser,
  refreshToken
};
