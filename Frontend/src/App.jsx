import React,{useState} from "react";
import PythonTutor from "./components/PythonTutor";
import { createBrowserRouter,RouterProvider } from "react-router-dom";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const myroutes = createBrowserRouter([
    {
      path: "/",
      element: <PythonTutor isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}></PythonTutor>,
    },
    {
      path: "/signup",
      element: <SignUp isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}></SignUp>,
    },
    {
      path: "/signin",
      element: <SignIn isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}></SignIn>,
    },
  ]);

  return (
    <div>
      <RouterProvider router={myroutes}></RouterProvider>
    </div>
  );
};

export default App;
