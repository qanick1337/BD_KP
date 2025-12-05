import express from "express";
import { getPopularCitiesStat, getCitySalaryExpectation } from "../controllers/statsController.js";

const router = express.Router();

router.get("/popularCities", getPopularCitiesStat);
router.get("/salaryExpectations", getCitySalaryExpectation);
export default router;