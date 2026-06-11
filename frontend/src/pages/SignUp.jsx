import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import bg from "../assets/background_image.jpeg";
import { IoEye } from "react-icons/io5";
import { IoEyeOff } from "react-icons/io5";
import { userDataContext } from "../context/UserContext";
import axios from "axios";

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const { serverUrl, userData, setUserData } = useContext(userDataContext);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      let result = await axios.post(
        `${serverUrl}/api/auth/signup`,
        {
          name,
          email,
          password,
        },
        { withCredentials: true },
      );
      
      setUserData(result.data);
      setLoading(false);
      navigate("/customize");

    } catch (error) {
      console.log(error);
      setLoading(false);
      setUserData(null);
      setErr(error.response?.data?.message || "Something went wrong. Is the server running?");
    }
  };

  return (
    <div
      className="w-full h-screen bg-cover flex justify-center items-center"
      style={{ backgroundImage: `url(https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSxiTO2eodvR94B-aRZRzfMa3vUcFYOLK_pA&s)` }}
    >
      <form
        className="w-105 h-120 max-w-125 bg-[#00000062] backdrop-blur shadow-lg shadow-black flex flex-col items-center justify-center gap-5 px-5 "
        onSubmit={handleSignUp}
      >
        <h1 className="text-white font-semibold mb-6.5">
          Register to
          <span className="text-[#a267da]"> Virtual Assistant</span>
        </h1>

        <input
          type="text"
          placeholder="Enter Your Name"
          className="w-full h-12 outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-5 py-2.5 rounded-full text-[15px] "
          required
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <input
          type="email"
          placeholder="Enter Your Email"
          className="w-full h-12 outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-5 py-2.5 rounded-full text-[15px] "
          required
          //  autoComplete="username"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />
        <div className="w-full h-12 border-2 border-white bg-transparent text-white rounded-full text-[15px] relative ">
          <input
            placeholder="Enter Your Password"
            type={showPassword ? "text" : "password"}
            className="w-full h-full rounded-full outline-none bg-transparent placeholder-gray-300 px-5 py-2.5 "
            required
            // autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
          />
          {!showPassword && (
            <IoEye
              className="absolute cursor-pointer top-2.5 right-5 w-6.25 h-6.25 text-white "
              onClick={() => setShowPassword(true)}
            />
          )}
          {showPassword && (
            <IoEyeOff
              className="absolute cursor-pointer top-2.5 right-5 w-6.25 h-6.25 text-white "
              onClick={() => setShowPassword(false)}
            />
          )}
        </div>

        {err.length > 0 && <p className="text-red-500 text-[17px]">*{err}</p>}

        <button className="min-w-37.5 h-12 mt-7.5 text-black font-semibold bg-white rounded-full text-[17px] " disabled={loading}>
          {loading ? "Loading....." : "Sign Up"}
        </button>

        <p
          className="text-white text-[15px] cursor-pointer "
          onClick={() => navigate("/signin")}
        >
          Already have an account ?
          <span className="text-[#a267da]"> Sign In</span>
        </p>
      </form>
    </div>
  );
}

export default SignUp;
