import express from "express";
import {
  downloadCandidatePdf,
  downloadActiveVacanciesReport,
} from "../controllers/reportController.js";
import requireAuth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/active_vacancies/pdf",
  requireAuth,
  downloadActiveVacanciesReport
);
router.get("/:candidate_id/pdf", requireAuth, downloadCandidatePdf);

export default router;
