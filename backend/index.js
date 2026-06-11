import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import authRouter from "./routes/authRouter.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/userRoutes.js";
import geminiResponse from "./gemini.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: ["http://localhost:5173","https://virtualassistant-563i.onrender.com"],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);


const port = process.env.PORT || 5000;

app.listen(port, async () => {
  await connectDb();
  console.log(`Server Started on PORT: http://localhost:${port}`);
});
