import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDarkMode } from "../context/DarkModeContext";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const {isDarkMode} = useDarkMode();

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("login successful");
        navigate("/");
      } else {
        alert("error : please try again !");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("error : please try again !");
    }
  };

  const MainStyle = isDarkMode? "w-full h-[100vh] flex flex-col items-center justify-center px-4 text-white bg-black" : "w-full h-[100vh] flex flex-col items-center justify-center px-4 text-black bg-white"
  const FormStyle = isDarkMode? "w-[450px] h-[60%] bg-gray-800 rounded-xl p-6":"w-[450px] h-[60%] bg-gray-200 rounded-xl p-6";
  const inputStyle = isDarkMode? "w-full bg-slate-600 p-2 font-semibold my-2 rounded-lg" : "w-full bg-slate-300 p-2 font-semibold my-2 rounded-lg"

  return (
    <div
      className={MainStyle}
    >
      <Link to="/">
        <h1 className="text-4xl my-6 font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          PythonPal 🐍
        </h1>
      </Link>

      <div className={FormStyle}>
        <h1 className="text-3xl font-bold text-center my-4">LogIn</h1>
        <form className="w-full h-full" onSubmit={handleSignIn}>
          <p className="font-semibold ">Email Address</p>
          <input
            className={inputStyle}
            type="text"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <p className="font-semibold ">Password</p>
          <input
            className={inputStyle}
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <div className="flex ">
            <input type="checkbox" /> <p className="mx-2 my-2">Remember me</p>
          </div>

          <button
            className="bg-green-600 w-full rounded-lg text-center py-2 font-semibold text-xl"
            type="submit"
          >
            Login
          </button>
          <div className={isDarkMode? "text-gray-300 flex items-center justify-center mt-6 text-center w-full" : "flex items-center justify-center mt-6 text-center w-full"}>
            <p>Don't have a account?</p>
            <Link to="/signup" className="text-green-400 mx-1">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;