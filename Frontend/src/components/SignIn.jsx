import React from "react";
import { Link } from "react-router-dom";

const SignIn = ({ isDarkMode, setIsDarkMode }) => {
  return (
    <div className={`w-full h-[100vh] flex flex-col items-center justify-center px-4 text-white bg-black`}>
       <h1 className="text-3xl my-4 font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
        PythonPal 🐍
      </h1>
      <div className="w-[450px] h-[60%] bg-gray-800 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-center">LogIn</h1>
        <form className="w-full h-full">
          <p>Email Address</p>
          <input className="w-full bg-gray-500" type="text" />
          <p>Password</p>
          <input type="password" />
          <button>Login</button>
          <div className="flex">
            <p>Don't have a account?</p>
            <Link>Sign up</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
