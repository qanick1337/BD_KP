import express from "express";
import {getAllCandidates, getCandidateById, getExpiriencesByCandidateId, getSkillsByCandidateId } from "../controllers/candidateController.js";
import requireAuth from "../middleware/authMiddleware.js"

const router = express.Router();

router.get("/",requireAuth, getAllCandidates);
router.get("/:candidate_id", requireAuth, getCandidateById);
router.get("/experience/:candidate_id",requireAuth, getExpiriencesByCandidateId);
router.get("/skills/:candidate_id", requireAuth, getSkillsByCandidateId);


export default router;