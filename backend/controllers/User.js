import User from "../models/user.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import geminiResponse from "../gemini.js";
import { response } from "express";
import moment from "moment";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json({ message: "Get current user error" });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;
    let assistantImage = imageUrl;

    if (req.file) {
      const upload = await uploadOnCloudinary(req.file.path);
      assistantImage = upload?.secure_url || imageUrl;
    }

    console.log("User ID:", req.userId);

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = user.toObject();
    delete updatedUser.password;

    console.log(updatedUser);

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "Update Assistant Error" });
  }
};

export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    console.log(command)
    const user = await User.findById(req.userId);

    user.history.push(command);
    await user.save();

    const lowerCommand = command.toLowerCase();
    let fastPathResult = null;

    // Fast Path: Check for simple keyword-based commands to save Gemini API Quota
    if (lowerCommand.includes("time") && (lowerCommand.includes("what") || lowerCommand.includes("tell"))) {
      fastPathResult = { type: "get-time", userInput: command, response: `Current time is ${moment().format("hh:mm A")}` };
    } else if (lowerCommand.includes("date") && (lowerCommand.includes("what") || lowerCommand.includes("tell"))) {
      fastPathResult = { type: "get-date", userInput: command, response: `Current date is ${moment().format("YYYY-MM-DD")}` };
    } else if (lowerCommand.includes("day") && (lowerCommand.includes("what") || lowerCommand.includes("tell"))) {
      fastPathResult = { type: "get-day", userInput: command, response: `Today is ${moment().format("dddd")}` };
    } else if (lowerCommand.includes("month") && (lowerCommand.includes("what") || lowerCommand.includes("tell"))) {
      fastPathResult = { type: "get-month", userInput: command, response: `Current month is ${moment().format("MMMM")}` };
    }

    if (fastPathResult) {
      console.log("Fast Path hit: Skipping Gemini API call for", fastPathResult.type);
      return res.json(fastPathResult);
    }

    const userName = user.name;
    const assistantName = user.assistantName;
    const result = await geminiResponse(command, assistantName, userName);

    const jsonMatch = result.match(/{[\s\S]*}/);

    if (!jsonMatch) {
      console.error("No JSON found in Gemini response:", result);
      return res.status(400).json({ response: "Sorry, I couldn't process that correctly." });
    }

    let gemResult;
    try {
      gemResult = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Original Result:", result);
      return res.json({
        type: "general",
        userInput: command,
        response: "I understood you, but I had trouble processing the response formatting.",
      });
    }

    const type = gemResult.type || "general";
    const userInput = gemResult.userInput || command;
    const aiResponse = gemResult.response || "I'm not sure what to say to that.";
 
    switch (type) {
      case "get-date":
        return res.json({
          type,
          userInput,
          response: `Current date is ${moment().format("YYYY-MM-DD")}`,
        });
      case "get-time":
        return res.json({
          type,
          userInput,
          response: `Current time is ${moment().format("hh:mm A")}`,
        });
      case "get-day":
        return res.json({
          type,
          userInput,
          response: `Today is ${moment().format("dddd")}`,
        });
      case "get-month":
        return res.json({
          type,
          userInput,
          response: `Current month is ${moment().format("MMMM")}`,
        });

      case "google-search":
      case "youtube-search":
      case "youtube-play":
      case "general":
      case "calculator-open":
      case "instagram-open":
      case "facebook-open":
      case "weather-show":
        return res.json({
          type,
          userInput,
          response: aiResponse,
        });

      default:
        return res.json({
          type: "general",
          userInput: command,
          response: aiResponse,
        });
    }

  } catch (error) {
    console.error("AskToAssistant Controller Error:", error);
    return res.status(500).json({ response: "Ask assistant error. Please try again." });
  }
};
