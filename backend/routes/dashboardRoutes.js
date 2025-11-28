import express from "express";
import {getCompanyName} from "../controllers/dashboardController.js"
import requireAuth from "../middleware/authMiddleware.js"

const router = express.Router();

router.get("/", requireAuth, getCompanyName);  

export default router;
