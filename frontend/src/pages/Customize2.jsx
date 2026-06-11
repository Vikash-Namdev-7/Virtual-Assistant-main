import React, { useContext, useState } from "react";
import { userDataContext } from "../context/UserContext";
import axios from "axios";
import { TiArrowBack } from "react-icons/ti";
import { useNavigate } from "react-router-dom";

const Customize2 = () => {
  const { userData, backendImage, selectedImage, serverUrl, setUserData } = useContext(userDataContext);
  const [assistantName, setAssistantName] = useState(
    userData?.assistantName || "",
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdateAssistant = async () => {

    setLoading(true);

    try {
        let formData = new FormData();
        formData.append("assistantName", assistantName)

        if(backendImage) {
            formData.append("assistantImage", backendImage)
        }else{
            formData.append("imageUrl", selectedImage)
        }

        const result = await axios.post(`${serverUrl}/api/user/update`, formData, {withCredentials:true})

        console.log(result.data);
        setUserData(result.data);
        setLoading(false);
        navigate("/");

    } catch (error) {
      setLoading(false);
        console.log(error);
    }
  }

  return (
    <div className="w-full h-screen bg-linear-to-t from-[black] to-[#49117d] flex justify-center items-center flex-col p-[20px] relative ">
      <TiArrowBack className="absolute top-[30px] left-[30px] text-white w-[25px] h-[25px] cursor-pointer " onClick={() => navigate("/customize")} />

      <h1 className="text-white text-[23px] text-center mb-[30px] ">
        Enter Your <span className="text-[#bca2d5]">Assistant Name</span>
      </h1>

      <input
        type="text"
        placeholder="eg. Shifra"
        className="w-full max-w-[500px] h-14 outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-5 py-2.5 rounded-full text-[16px] "
        required
        onChange={(e) => setAssistantName(e.target.value)}
        value={assistantName}
      />

      {assistantName && (
        <button
          onClick={() => {
            handleUpdateAssistant();
          }}
          className="min-w-[300px] h-12 mt-9 text-black font-semibold cursor-pointer bg-white rounded-full text-[17px]  "
        >
          {!loading ? "Finally Create Your Assistant" : "Loading....."}
        </button>
      )}
    </div>
  );
};

export default Customize2;
