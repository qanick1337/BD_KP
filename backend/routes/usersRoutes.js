import express from "express";
import { getCompanyUsers, getAdminStatus, getUserById, updateUserById, deleteUserById, createCompanyUser,getUserByEmail} from "../controllers/usersController.js";
import requireAuth from "../middleware/authMiddleware.js"

const router = express.Router();

router.get("/", requireAuth, getCompanyUsers);
router.get("/is-admin", requireAuth, getAdminStatus); 
router.get("/me", requireAuth, getUserByEmail);
router.get("/:id", requireAuth, getUserById);
router.put("/:id", requireAuth, updateUserById);
router.delete("/:id", requireAuth, deleteUserById);
router.post("/", requireAuth, createCompanyUser);

export default router;
