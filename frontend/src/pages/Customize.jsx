import React, { useContext, useRef } from "react";
import { FaImage } from "react-icons/fa6";
import Card from "../components/Card";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/authBg.png";
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import image6 from "../assets/image6.jpeg";
import image7 from "../assets/image7.jpeg";
import { useState } from "react";
import { userDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { TiArrowBack } from "react-icons/ti";


function Customize() {
  const {
    serverUrl,
    userData,
    setUserData,
    frontendImage,
    setFrontEndImage,
    backendImage,
    setBackendImage,
    selectedImage,
    setSelectedImage,
  } = useContext(userDataContext);

  const navigate = useNavigate();

  const inputImage = useRef();

  const handleImage = (e) => {
    console.log(e);
    const file = e.target.files[0];
    setBackendImage(file);
    setFrontEndImage(URL.createObjectURL(file));
  };

  return (
    <div className="w-full h-screen bg-linear-to-t from-[black] to-[#49117d] flex justify-center items-center flex-col p-[20px] relative ">

      <TiArrowBack className="absolute top-[30px] left-[30px] text-white w-[25px] h-[25px] cursor-pointer " onClick={() => navigate("/")} />

      <h1 className="text-white text-[25px] text-center mb-[17px] ">
        Select your <span className="text-[#a267da]">Assistant Image</span>
      </h1>
      <div className="w-full max-w-[800px] flex justify-center items-center flex-wrap gap-[15px]  ">
        <Card image={image1} />
        <Card image={image2} />
        <Card image={image3} />
        <Card image={image4} />
        <Card image={image5} />
        <Card image={image6} />
        <Card image={image7} />

        <div
          className={`w-[70px] h-[140px] lg:w-[130px] lg:h-[190px] bg-[#030326] border-2 border-[#0000ff78] rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-blue-950 cursor-pointer hover:border-4 hover:border-white flex justify-center items-center  ${selectedImage == "input" ? "border-4 border-white shadow-2xl shadow-blue-950" : null} `}
          onClick={() => {
            inputImage.current.click()
            setSelectedImage("input")
          }}
        >
          {!frontendImage && (
            <FaImage className="text-white w-[25px] h-[25px] " />
          )}

          {frontendImage && (
            <img src={frontendImage} className="h-full object-cover" />
          )}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={inputImage}
          hidden
          onChange={handleImage}
        />
      </div>
      {selectedImage && <button onClick={() => navigate("/customize2")}
      className="min-w-37.5 h-15 mt-6.5 text-black font-semibold cursor-pointer bg-white rounded-full text-[19px]  ">
        Next
      </button> }
      
    </div>
  );
}

export default Customize;
