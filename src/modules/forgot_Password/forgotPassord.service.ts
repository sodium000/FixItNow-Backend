import { prisma } from "../../lib/prisma.js";
import giveotp from "../../lib/redis/otp_route.js";

interface Playlode {
    email : string
}



export const getOTP = async(playlode : Playlode)=>{

        const {email}= playlode;

    const existingUser = await prisma.user.findUnique({
      where: { email: email},
    });

    if(!existingUser){
        throw new Error("User not found give the valid emaill");
    }

    giveotp()

    return({
        message : "otp send"
    })
}