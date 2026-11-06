import express from "express";
import { GetToken } from "../../../../middleware/GetToken.js";
import * as clientController from "./TransfertControllers.js";

const router = express.Router();

router.post("/request-transfer", GetToken, clientController.requestTransfer);
router.post("/confirm-transfer", GetToken, clientController.confirmTransfer);

export default router;