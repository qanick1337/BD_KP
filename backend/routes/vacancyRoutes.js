import express from "express";
import requireAuth from "../middleware/authMiddleware.js";
import {
  createVacancy,
  getCompanyVacancies,
} from "../controllers/vacancyController.js";

const router = express.Router();

router.get("/", requireAuth, getCompanyVacancies);
router.post("/", requireAuth, createVacancy);

export default router;
