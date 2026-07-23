import { useContext } from "react";
import { CoreAccessContext } from "../context/CoreAccessContext"

export const useCoreAccess = () => {
  const context = useContext(CoreAccessContext);

  if (!context) {
    throw new Error(
      "useCoreAccess debe utilizarse dentro de CoreAccessProvider.",
    );
  }

  return context;
};
