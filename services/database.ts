import * as sqlite from "expo-sqlite";

export const db = sqlite.openDatabaseSync("lockedin.db");

export const databaseInit = async () => {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      deadline TEXT,
      efficiency INTEGER DEFAULT 0,
      timeLogged INTEGER DEFAULT 0,
      color TEXT DEFAULT '#f59e0b',
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      goalId INTEGER NOT NULL,
      startedAt TEXT NOT NULL,
      endedAt TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (goalId) REFERENCES goals(id)
    );
    `);
};

export const getAllGoals = async () => {
  const goals = await db.getAllAsync(
    "SELECT * FROM goals ORDER BY createdAt DESC"
  );

  return goals;
};

export const getGoalById = async (id: number) => {
  const goal = await db.getFirstAsync("SELECT * FROM goals WHERE id = ?", [id]);

  return goal;
};

export const createGoal = async (goal: {
  title: string;
  description?: string;
  deadline: string;
  timeLogged: number;
  color?: string;
}) => {
  const result: { lastInsertRowId: number } = await db.runAsync(
    "INSERT INTO goals (title, description, deadline, timeLogged, color) VALUES (?, ?, ?, ?, ?)",
    [
      goal.title,
      goal.description || null,
      goal.deadline,
      goal.timeLogged,
      goal.color || "#f59e0b",
    ]
  );

  return result.lastInsertRowId;
};

export const updateGoal = async (
  id: number,
  goal: {
    title?: string;
    description?: string;
    deadline?: string;
    timeLogged?: number;
    color?: string;
  }
) => {
  const existingGoal = (await getGoalById(id)) as {
    title: string;
    description: string;
    deadline: string;
    timeLogged: number;
    color: string;
  };

  if (!existingGoal) {
    throw new Error("Goal not found");
  }

  await db.runAsync(
    "UPDATE goals SET title = ?, description = ?, deadline = ?, timeLogged = ?, color = ? WHERE id = ?",
    [
      goal.title || existingGoal.title,
      goal.description || existingGoal.description,
      goal.deadline || existingGoal.deadline,
      goal.timeLogged || existingGoal.timeLogged,
      goal.color || existingGoal.color,
      id,
    ]
  );
};

export const deleteGoal = async (id: number) => {
  await db.runAsync("DELETE FROM goals WHERE id = ?", [id]);
};
