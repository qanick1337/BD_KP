import express from "express";
import {createApplication} from "../controllers/applicationController.js";
import requireAuth from "../middleware/authMiddleware.js"

const router = express.Router();

router.post("/",requireAuth, createApplication);


export default router;