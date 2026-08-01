// routes/admin.routes.js
import express from "express";
import { GetToken } from "../../../middleware/GetToken.js";
import { isAdmin } from "../../../middleware/IsAdmin.js";
import  freezeUserConttroller  from "./FreezeControllers.js";

const router = express.Router();

router.patch("/freeze/:clientId", GetToken, isAdmin, freezeUserConttroller);

export default router;