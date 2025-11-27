import express from "express";
import {registerCompany} from "../controllers/registerController.js"
import requireAuth from "../middleware/authMiddleware.js"

const router = express.Router();

router.put("/register", registerCompany);  

export default router;