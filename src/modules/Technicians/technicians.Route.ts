import { Request, Response, Router } from "express";
import { getTecnicians } from "./technicians.controller";

 const router = Router();

router.get("/technicians", getTecnicians.getAllTecnicians );


export const tecnicianFilter = router