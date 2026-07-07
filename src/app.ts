import cookieParser from "cookie-parser";
import express,{ Application, Request, Response } from "express";
import cors from "cors"
import config from "./config";
import { userRoute } from "./modules/userModules/user.Route";
import { notFound } from "./middlewares/notFound";
import { logUser } from "./modules/authMoules/auth.Route";


const app: Application = express()

app.use(cors({
    origin : config.app_url,
    credentials : true
}))

app.use(express.json());
app.use(express.urlencoded({extended : true})); 
app.use(cookieParser());


app.get('/', (req:Request, res:Response) => {
  res.send('Hello World!')
})

app.use("/api/auth", userRoute);
app.use("/api/authlogin", logUser);




app.use(notFound)
export default app 



