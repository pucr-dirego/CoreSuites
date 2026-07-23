import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { CoreUserProvider } from "./context/CoreUserContext";
import { CoreAccessProvider } from "./context/CoreAccessContext.tsx"
import "./styles/theme.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CoreUserProvider>
      <CoreAccessProvider>
        <App />
      </CoreAccessProvider>
    </CoreUserProvider>
  </StrictMode>
);
