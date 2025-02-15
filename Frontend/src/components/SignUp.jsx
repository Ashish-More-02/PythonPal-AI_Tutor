import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const SignUp = ({ isDarkMode, setIsDarkMode }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cnfpassword, setCnfPassword] = useState("");

  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name ,email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("signup successful");
        navigate("/signin");
      } else {
        alert("error : please try again !");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert("error : please try again !");
    }
  };

  const navigate = useNavigate();
  return (
    <div
      className={`w-full h-[100vh] flex flex-col items-center justify-center px-4 text-white bg-black`}
    >
      <Link to="/">
        <h1 className="text-4xl my-6 font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          PythonPal 🐍
        </h1>
      </Link>

      <div className="w-[450px] bg-gray-800 rounded-xl p-6">
        <h1 className="text-3xl font-bold text-center my-4">Sign up</h1>
        <form className="w-full h-fit" onSubmit={handleSignUp}>
          <p className="font-semibold ">Full Name</p>
          <input
            className="w-full bg-slate-600 p-2 font-semibold my-2 rounded-lg"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <p className="font-semibold ">Email Address</p>
          <input
            className="w-full bg-slate-600 p-2 font-semibold my-2 rounded-lg"
            type="text"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          <p className="font-semibold ">Password</p>
          <input
            className="bg-slate-600 w-full p-2 font-semibold my-2 rounded-lg"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <p className="font-semibold ">Confirm Password</p>
          <input
            className="bg-slate-600 w-full p-2 font-semibold my-2 rounded-lg"
            type="password"
            value={cnfpassword}
            onChange={(e) => {
              setCnfPassword(e.target.value);
            }}
          />

          <button
            className="bg-green-600 my-2 w-full rounded-lg text-center py-2 font-semibold text-xl"
            type="submit"
          >
            Sign up
          </button>
          <div className="flex items-center justify-center mt-6 text-center text-gray-300 w-full">
            <p>Already have a account?</p>
            <Link to="/signin" className="text-green-400 mx-1">
              Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
