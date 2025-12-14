import express from "express";
import {
  createSweet,
  getAllSweets,
  searchSweets,
  getSweetById,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet,
} from "../Controllers/sweet.controller.js";
import { authenticate, authorizeAdmin } from "../Middlewares/index.js";

const router = express.Router();

// Public
router.get("/", getAllSweets);
router.get("/search", searchSweets);
router.get("/:id", getSweetById);

// Protected
router.post("/", authenticate, authorizeAdmin, createSweet);
router.put("/:id", authenticate, authorizeAdmin, updateSweet);
router.delete("/:id", authenticate, authorizeAdmin, deleteSweet);
router.post("/:id/purchase", authenticate, purchaseSweet);
router.post("/:id/restock", authenticate, authorizeAdmin, restockSweet);

export default router;

