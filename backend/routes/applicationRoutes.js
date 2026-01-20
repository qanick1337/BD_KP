import express from "express";
import {
  createApplication,
  getApplications,
  getUserApplications,
  updateApplication,
} from "../controllers/applicationController.js";
import requireAuth from "../middleware/authMiddleware.js"

const router = express.Router();

router.get("/", requireAuth, getApplications);
router.get("/user", requireAuth, getUserApplications);
router.post("/",requireAuth, createApplication);
router.put("/:application_id", requireAuth, updateApplication);


export default router;
