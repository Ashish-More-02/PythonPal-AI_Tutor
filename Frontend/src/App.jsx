import React, { useEffect, useState } from "react";
import PythonTutor from "./components/PythonTutor";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import Landing from "./components/homepage/Landing";
import ProtectedRoute from "./utils/ProtectedRoute";
import { DarkModeContext } from "./context/DarkModeContext";
import { AuthProvider } from "./context/AuthContext";
import AI_agent from "./pages/AI_agent";

// Created once, outside the component. RouterProvider freezes on the first
// router it receives, so recreating it on every render (and baking props into
// the route elements) would make prop updates like dark mode never re-render.
const myroutes = createBrowserRouter([
  {
    // Public homepage: pick Login or Register.
    path: "/",
    element: <Landing></Landing>,
  },
  {
    path: "/signup",
    element: <SignUp></SignUp>,
  },
  {
    path: "/signin",
    element: <SignIn></SignIn>,
  },
  {
    // The actual product — only reachable once logged in.
    path: "/app",
    element: (
      <ProtectedRoute>
        <AI_agent></AI_agent>
      </ProtectedRoute>
    ),
  },
]);

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Streamdown styles itself with Tailwind `dark:` variants, which read the
  // root class rather than this context.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  return (
    <AuthProvider>
      <DarkModeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
        <RouterProvider router={myroutes}></RouterProvider>
      </DarkModeContext.Provider>
    </AuthProvider>
  );
};

export default App;
