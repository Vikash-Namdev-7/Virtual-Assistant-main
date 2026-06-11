import axios from "axios";

const geminiResponse = async (command, assistantName, userName) => {
  try {
    const apiUrl = process.env.GEMINI_API_URL;

    if (!apiUrl) {
      console.error("GEMINI_API_URL is not defined in .env");
      throw new Error("API URL is missing");
    }

    const prompt = `You are a virtual assistant named ${assistantName || "Assistant"} created by ${userName || "User"}.
    
    You are a voice-enabled assistant. Your response should be short, friendly, and concise.

    Your task is to understand the user's natural language input and respond ONLY with a valid JSON object.
    
    JSON Format:
    {
      "type": "intent-type",
      "userInput": "processed user input",
      "response": "spoken response"
    }

    Types:
    - "general": factual questions or simple conversation.
    - "google-search": for searching on Google.
    - "youtube-search": for searching on Youtube.
    - "youtube-play": for playing a specific video/song.
    - "calculator-open": to open calculator.
    - "instagram-open": to open instagram.
    - "facebook-open": to open facebook.
    - "weather-show": to show weather.
    - "get-time": current time.
    - "get-date": today's date.
    - "get-day": current day.
    - "get-month": current month.

    Rules:
    1. If searching google/youtube, "userInput" should ONLY contain the search query, not the full phrase (e.g., if user says "search for apples", userInput should be "apples").
    2. Remove your name (${assistantName}) from "userInput" if mentioned.
    3. The "response" field should be what you will SPEAK back to the user.
    4. Respond ONLY with the JSON object. Do not include any explanation or markdown formatting.

    User Input: "${command}"
    `;

    const result = await axios.post(apiUrl, {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      // Adding safety settings to reduce random bloking for harmless prompts
      safetySettings: [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
      ]
    }, {
      timeout: 10000 // 10 second timeout
    });

    if (result.data && result.data.candidates && result.data.candidates[0]) {
      let text = result.data.candidates[0].content.parts[0].text;
      
      // Clean markdown formatting if present
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
      
      return text;
    }
    
    console.error("Gemini API: No candidates returned", result.data);
    return JSON.stringify({ 
      type: "general", 
      userInput: command, 
      response: "I'm having trouble thinking right now. Please try again." 
    });

  } catch (error) {
    const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
    console.error("Gemini API Error Detail:", errorMsg);
    
    // If it's a safety block or rate limit, we catch it here
    return JSON.stringify({ 
      type: "general", 
      userInput: command, 
      response: "Sorry, I'm experiencing some technical difficulties. Can we try again?" 
    });
  }
};

export default geminiResponse;
