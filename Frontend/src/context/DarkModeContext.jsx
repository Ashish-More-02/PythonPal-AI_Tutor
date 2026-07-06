import { createContext, useContext } from "react";

// Shared dark-mode state. Consumed via useDarkMode() so components get the
// live value instead of props frozen inside a once-created router.
export const DarkModeContext = createContext();

export const useDarkMode = () => useContext(DarkModeContext);
