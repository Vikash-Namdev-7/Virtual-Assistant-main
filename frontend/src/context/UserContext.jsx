import axios from "axios";
import React, { createContext, useState, useCallback } from "react";
import { useEffect } from "react";

export const userDataContext = createContext();

const UserContext = ({ children }) => {
  const serverUrl = "virtual-assistant-backend-nine.vercel.app";
  const [userData, setUserData] = useState(null);
  const [frontendImage, setFrontEndImage] = useState(null);
  const [backendImage, setBackendImage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, {
        withCredentials: true,
      });
      setUserData(result.data);
      console.log(result.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getGeminiResponse = async (command) => {
    try {
      const result = await axios.post(
        `${serverUrl}/api/user/asktoassistant`,
        { command },
        { withCredentials: true },
      );
      return result.data;
    } catch (error) {
      console.log("Context API Error:", error);
      
      if (error.response?.status === 429) {
        return {
          response: "Assistant's daily limit reached. Please try after some time or tomorrow.",
          type: "general"
        };
      }

      return (
        error.response?.data || {
          response: "Network error or API limit exceeded. Please check your connection.",
          type: "general"
        }
      );
    }
  };

  useEffect(() => {
    handleCurrentUser();
  }, []);

  const value = {
    serverUrl,
    userData,
    setUserData,
    frontendImage,
    setFrontEndImage,
    backendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage,
    getGeminiResponse,
  };

  return (
    <div>
      <userDataContext.Provider value={value}>
        {children}
      </userDataContext.Provider>
    </div>
  );
};

export default UserContext;
