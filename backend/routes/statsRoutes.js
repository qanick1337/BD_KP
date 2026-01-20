import express from "express";
import {
  getPopularCitiesStat,
  getCitySalaryExpectation,
  getApplicationsStatsByCompanyId,
  getUsersStatsByCompanyId,
} from "../controllers/statsController.js";
import requireAuth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/popularCities", getPopularCitiesStat);
router.get("/salaryExpectations", getCitySalaryExpectation);
router.get("/company", requireAuth, getApplicationsStatsByCompanyId);
router.get("/user_stats", requireAuth, getUsersStatsByCompanyId);

export default router;
