import express from "express";
import { getAllCountries } from "../controllers/testController.js";

const router = express.Router();

router.get("/", getAllCountries);

export default router;
