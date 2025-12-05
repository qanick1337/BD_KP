import express from "express";
import requireAuth from "../middleware/authMiddleware.js";
import {
  createVacancy,
  getCompanyVacancies,
  getUserVacancies,
  deleteVacancy,
  updateVacancyById,
  getVacancyById,
  getSkillsByVacancyId,
} from "../controllers/vacancyController.js";

const router = express.Router();

router.get("/", requireAuth, getCompanyVacancies);
router.post("/", requireAuth, createVacancy);
router.get("/user", requireAuth, getUserVacancies);
router.get("/:vacancy_id", requireAuth, getVacancyById);
router.delete("/:vacancy_id", requireAuth, deleteVacancy);
router.put("/:vacancy_id", requireAuth, updateVacancyById);
router.get("/:vacancy_id/skills", requireAuth, getSkillsByVacancyId);

export default router;
