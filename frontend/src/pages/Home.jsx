import React, { useContext, useEffect } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useState } from "react";
import { useRef } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { ImCross } from "react-icons/im";

import aiImg from "../assets/ai.gif";
import userImg from "../assets/user.gif";

function Home() {
  const { userData, serverUrl, setUserData, getGeminiResponse } =
    useContext(userDataContext);
  const navigate = useNavigate();
  const [listening, setListening] = useState(false);

  const [userText, setUserText] = useState("");
  const [aiText, setAiText] = useState("");
  const [hamBurger, setHamBurger] = useState(false);

  const isSpeakingRef = useRef(false);
  const recognitionRef = useRef(null);
  const isRecognizingRef = useRef(false);

  const synth = window.speechSynthesis;

  const handleLogOut = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      setUserData(null);
      navigate("/signin");
    } catch (error) {
      setUserData(null);
      console.log(error);
    }
  };

  const startRecognition = () => {

      if(!isSpeakingRef.current && !isRecognizingRef.current) {
      try {
        recognitionRef.current?.start();
        console.log("Recognition requested to start");
      } catch (error) {
        if (error.name !== "InvalidStateError") {
          console.error("Start error:", error);
        }
      }
    };
  }

  const speak = (text) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;

      utterance.lang = "hi-IN";
      const voices = window.speechSynthesis.getVoices();
      const hindiVoice = voices.find((v) => v.lang === "hi-IN");
      if (hindiVoice) {
        utterance.voice = hindiVoice;
      }
      isSpeakingRef.current = true;
      utterance.onend = () => {
        setAiText("");
        isSpeakingRef.current = false;

        setTimeout(() => {
          startRecognition();  // Delay se race condition avoid hoti hai
        }, 800);
      };
      synth.cancel();
      synth.speak(utterance);
    };


    const handleCommand = (data) => {
      const {type, userInput, response} = data;
      speak(response);

      if(type === 'google-search') {
        const query = encodeURIComponent(userInput);
        window.open(`https://www.google.com/search?q=${query}`, '_blank');
      }

      if(type === 'calculator-open') {
        window.open(`https://www.google.com/search?q=calculator`, '_blank');
      }

      if(type === 'instagram-open') {
        window.open(`https://www.instagram.com/`, '_blank');
      }

      if(type === 'facebook-open') {
        window.open(`https://www.facebook.com/`, '_blank');
      }

      if(type === 'weather-show') {
        window.open(`https://www.instagram.com/search?q=weather`, '_blank');
      }

      if(type === 'youtube-search' || type === 'youtube-play') {
        const query = encodeURIComponent(userInput);
        window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
      }  
    }



  useEffect(() => {
    const speechRecongnition = window.speechRecognition || window.webkitSpeechRecognition;
    const recognition = new speechRecongnition();
      
    recognition.continuous = true;
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognitionRef.current = recognition;

    let isMounted = true; //Flag to avoid setState on unmounted components

    // Start recognition after 1 second delay only if component still mounted

    const startTimeout = setTimeout(() => {
      
      if(isMounted && !isSpeakingRef.current && !isRecognizingRef.current) {

        try {
          
          recognition.start();
          console.log("Recognition requested to start")

        } catch (e) {
          if(e.name !== "InvalidStateError") {
            console.error(e);
          }
        }
      }
    }, 1000);

    recognition.onstart = () => {
      // console.log("Recognition started");
      isRecognizingRef.current = true;
      setListening(true);
    };

    recognition.onend = () => {
      // console.log("Recognition ended");
      isRecognizingRef.current = false;
      setListening(false);

      if (isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if(isMounted) {
            try {
              
              recognition.start();
              console.log("Recognition restarted")

            } catch (e) {
              if(e.name !== "InvalidStateError") console.error(e);
            }
          }
        }, 1000); //Delay avoids rapid loop
      }
    };

    recognition.onerror = (event) => {
      console.warn("Recognition error:", event.error);
      isRecognizingRef.current = false;
      setListening(false);

      if (event.error !== "aborted" && isMounted && !isSpeakingRef.current) {
        setTimeout(() => {
          if(isMounted) {
            try {
              recognition.start();
              console.log("Recognition restarted after error");
            } catch (e) {
              if(e.name !== "InvalidStateError") console.error(e);
            }
          }
        }, 1000);
      }
    };

    recognition.onresult = async (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript.trim();
      // console.log("Heard:", transcript);

      // const nameToMatch = userData.assistantName.toLowerCase().trim();
      // console.log(`Matching against name: "${nameToMatch}"`);

      if (transcript.toLowerCase().includes(userData.assistantName.toLowerCase())) {
        // console.log("Assistant name detected! Calling Gemini API...");

        setAiText("");
        setUserText(transcript);
        recognition.stop();
        isRecognizingRef.current = false;
        setListening(false);

        const data = await getGeminiResponse(transcript);
        handleCommand(data);

        // if (!data) {
        //   console.error("No data received from backend");
        //   return;
        // }

        setAiText(data.response);
        setUserText("");

        // console.log("Response Data:", data);
        // if (data.response) {
        //   speak(data.response);
        // }

      }
    };
    //     setTimeout(() => {
    //       switch (data.type) {
    //         case "google-search":
    //           window.open(
    //             `https://www.google.com/search?q=${data.userInput}`,
    //             "_blank",
    //           );
    //           break;
    //         case "youtube-search":
    //           window.open(
    //             `https://www.youtube.com/results?search_query=${data.userInput}`,
    //             "_blank",
    //           );
    //           break;
    //         case "youtube-play":
    //           window.open(
    //             `https://www.youtube.com/results?search_query=${data.userInput}`,
    //             "_blank",
    //           );
    //           break;
    //         case "calculator-open":
    //           window.open(
    //             "https://www.google.com/search?q=calculator",
    //             "_blank",
    //           );
    //           break;
    //         case "instagram-open":
    //           window.open("https://www.instagram.com", "_blank");
    //           break;
    //         case "facebook-open":
    //           window.open("https://www.facebook.com", "_blank");
    //           break;
    //         case "weather-show":
    //           window.open(
    //             `https://www.google.com/search?q=weather+${data.userInput}`,
    //             "_blank",
    //           );
    //           break;
    //         default:
    //           break;
    //       }
    //     }, 1500);
    //   }
    // };



    // const safeRecognition = () => {
    //   if (!isSpeakingRef.current && !isRecognizingRef.current) {
    //     try {
    //       recognition.start();
    //       console.log("Recognition requested to start");
    //     } catch (err) {
    //       if (err.name !== "InvalidStateError") {
    //         console.error("Start error:", err);
    //       }
    //     }
    //   }
    // };


    // const fallback = setInterval(() => {
    //   if (!isSpeakingRef.current && !isRecognizingRef.current) {
    //     safeRecognition();
    //   }
    // }, 10000);

    // safeRecognition();



      const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, What can I help you with?`);
      greeting.lang = 'hi-IN';
      window.speechSynthesis.speak(greeting);


    return () => {
      isMounted = false;
      clearTimeout(startTimeout);
      recognition.stop();
      setListening(false);
      isRecognizingRef.current = false;
      // clearInterval(fallback);
    };
  }, []);

  return (
    // from-[black] to-[#030353]
    <div className="w-full h-screen bg-linear-to-t from-[black] to-[#49117d] flex justify-center items-center flex-col gap-[15px] overflow-hidden ">
      <GiHamburgerMenu
        className="lg:hidden text-white absolute top-[25px] right-[20px] w-[25px] h-[25px] "
        onClick={() => setHamBurger(true)}
      />

      <div
        className={`absolute p-[20px] top-0 w-full h-full bg-[#00000053] backdrop-blur-lg flex flex-col gap-[20px] items-start ${hamBurger ? "translate-x-0 block " : "translate-x-full hidden "} transition-transform`}
      >
        <ImCross
          className="lg:hidden text-white absolute top-[25px] right-[25px] w-[21px] h-[21px] "
          onClick={() => setHamBurger(false)}
        />

        <button
          className="min-w-31.5 h-12 text-black font-semibold bg-white rounded-full text-[16px] absolute cursor-pointer "
          onClick={handleLogOut}
        >
          Log Out
        </button>

        <button
          className="min-w-34.5 h-13 mt-[70px] text-black font-semibold bg-white rounded-full text-[16px] px-[20px] py-[12px] cursor-pointer "
          onClick={() => navigate("/customize")}
        >
          Customize your Assistant
        </button>

        <div className="w-full h-[2px] bg-gray-400"></div>
        <h1 className="text-white font-semibold text-[19px] ">History</h1>

        <div className="w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col">
          {userData.history?.map((his) => (
            <span className="text-gray-200 text-[18px] truncate ">{his}</span>
          ))}
        </div>
      </div>

      <button
        className="min-w-35.5 h-12 mt-6.5 text-black font-semibold bg-white rounded-full text-[17px] absolute top-[20px] right-[20px] cursor-pointer hidden lg:block "
        onClick={handleLogOut}
      >
        Log Out
      </button>

      <button
        className="hidden lg:block min-w-35.5 h-13 mt-4.5 text-black font-semibold bg-white rounded-full text-[17px] absolute top-[100px] right-[20px] px-[18px] py-[8px] cursor-pointer "
        onClick={() => navigate("/customize")}
      >
        Customize your Assistant
      </button>

      <div className="w-[200px] h-[250px] mt-[15px] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg ">
        <img
          src={userData?.assistantImage}
          alt="Assistant Image"
          className="h-full object-cover"
        />
      </div>
      <h1 className="text-white text-[16px] m-[8px] font-semibold ">
        I'm {userData?.assistantName}
      </h1>

      {!aiText && <img src={userImg} alt="AI Image" className="w-[140px] mix-blend-screen" />}
      {aiText && <img src={aiImg} alt="AI Image" className="w-[140px] mix-blend-screen" />}

      <h1 className="text-white text-[17px] w-[90%] mb-[8px] text-center font-semibold text-wrap">
        {userText ? userText : aiText ? aiText : null}
      </h1>
    </div>
  );
}

export default Home;
