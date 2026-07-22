import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CoreUserProvider } from "./context/CoreUserContext";
import "./styles/theme.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CoreUserProvider>
      <App />
    </CoreUserProvider>
  </StrictMode>
);
