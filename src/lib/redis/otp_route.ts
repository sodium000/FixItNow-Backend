
import { client, generateOTP } from "./redis.js";



const giveotp = async()=>{

    const getOtp = generateOTP()

    await client.set('otp1 ', getOtp,{
      EX:5*60
    });
}

export default giveotp;