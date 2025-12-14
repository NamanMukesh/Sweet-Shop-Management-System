import express from "express";
import { register, login, getMe } from "../Controllers/auth.controller.js";
import { authenticate } from "../Middlewares/index.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, getMe);

export default router;

