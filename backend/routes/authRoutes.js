import express from "express";
import {loginCompany} from "../controllers/authController.js"
import requireAuth from "../middleware/authMiddleware.js"

const router = express.Router();

router.post("/login", loginCompany);  

export default router;