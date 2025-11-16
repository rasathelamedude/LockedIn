import cors from "cors";
import express from "express";
import { PORT } from "./config/env.ts";
import goalsRouter from "./routes/goals.routes.ts";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/goals", goalsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
