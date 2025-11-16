import { Router } from "express";
import { getAllGoals } from "../controllers/goals.controller.ts";

const router = Router();

// Define your goal-related routes here
router.get("/", getAllGoals);

export default router;
