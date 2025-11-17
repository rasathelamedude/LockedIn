import { prisma } from "../config/prisma.ts";

export const getAllGoals = async (req: any, res: any) => {
  try {
    const goals = await prisma.goal.findMany();

    res.status(200).json({
      status: "success",
      message: "Retrieved all goals",
      data: goals,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};

export const createGoal = async (req: any, res: any) => {
  try {
    const newGoalData = req.body;

    if (!newGoalData) {
      res.status(401).json({
        status: "failure",
        message: "Required data is missing!",
      });
    }

    const newGoal = await prisma.goal.create({
      data: newGoalData as any,
    });

    res.status(201).json({
      status: "success",
      message: "Goal created successfully",
      data: newGoal,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};

export const updateGoal = async (req: any, res: any) => {
  try {
    const goalId = req.params.id;
    const updatedData = req.body;

    if (!updatedData) {
      res.status(401).json({
        status: "failure",
        message: "Required data is missing!",
      });
    }

    const updatedGoal = await prisma.goal.update({
      where: {
        id: goalId,
      },
      data: updatedData,
    });

    res.status(200).json({
      status: "success",
      message: "Updated goal successfully",
      data: updatedGoal,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};

export const deleteGoal = async (req: any, res: any) => {
  try {
    const goalId = req.params.id;

    const deletedGoal = await prisma.goal.delete({
      where: {
        id: goalId,
      },
    });

    res.status(200).json({
      status: "success",
      message: "Deleted goal successfully",
      data: deletedGoal,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};
