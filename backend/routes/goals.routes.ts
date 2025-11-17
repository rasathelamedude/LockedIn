import { Router } from "express";
import {
  createGoal,
  deleteGoal,
  getAllGoals,
  updateGoal,
} from "../controllers/goals.controller.ts";

const router = Router();

// Define your goal-related routes here
router.get("/", getAllGoals);
router.post("/", createGoal);
router.patch("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;
