import httpStatus from "http-status";
import { Request, Response } from "express";
import { getOTP } from "./forgotPassord.service";



export const forgotPass = async(req:Request,res:Response)=>{

    const playlode= req.body

    if(!playlode){
       return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message:"Give the verifid eamil"
       })
    }

    const result = await getOTP(playlode);

    return res.status(httpStatus.OK).json({
        success : true,
        message: "OTP send you mail",
        data : result
    })
}