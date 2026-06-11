import express from "express";
import { askToAssistant, getCurrentUser, updateAssistant } from "../controllers/User.js";
import isAuth from "../middelwares/isAuth.js";
import upload from "../middelwares/multer.js";

const userRouter = express.Router();

userRouter.get("/current", isAuth, getCurrentUser);
userRouter.post(
  "/update",
  isAuth,
  upload.single("assistantImage"),
  updateAssistant,
);
userRouter.post("/asktoassistant", isAuth, askToAssistant);

export default userRouter;
