import express from "express";
import {
  getCountries,
  getCities,
  getEmploymentTypes,
  getCategories,
  getSkills,
  getVacancyStatuses,
  getApplicationStatuses,
  createSkill,
} from "../controllers/dictController.js";

const router = express.Router();

router.get("/countries", getCountries);
router.get("/cities", getCities);
router.get("/employment-types", getEmploymentTypes);
router.get("/categories", getCategories);
router.get("/skills", getSkills);
router.post("/skills", createSkill);
router.get("/vacancy-statuses", getVacancyStatuses);
router.get("/application-statuses", getApplicationStatuses);

export default router;
