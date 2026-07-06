import React, { useState } from "react";
import PythonTutor from "./components/PythonTutor";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import { DarkModeContext } from "./context/DarkModeContext";

// Created once, outside the component. RouterProvider freezes on the first
// router it receives, so recreating it on every render (and baking props into
// the route elements) would make prop updates like dark mode never re-render.
const myroutes = createBrowserRouter([
  {
    path: "/",
    element: <PythonTutor></PythonTutor>,
  },
  {
    path: "/signup",
    element: <SignUp></SignUp>,
  },
  {
    path: "/signin",
    element: <SignIn></SignIn>,
  },
]);

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <DarkModeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      <RouterProvider router={myroutes}></RouterProvider>
    </DarkModeContext.Provider>
  );
};

export default App;
