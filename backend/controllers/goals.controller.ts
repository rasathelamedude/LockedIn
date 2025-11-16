import { prisma } from "../config/prisma.ts";

export const getAllGoals = async (req: any, res: any) => {
  try {
    const goals = await prisma.goal.findMany();

    res.status(200).json({
      status: "success",
      data: goals,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch goals" });
  }
};
