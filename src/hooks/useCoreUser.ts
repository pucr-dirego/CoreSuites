import { useContext } from "react";
import { CoreUserContext } from "../context/CoreUserContext";

export const useCoreUser = () => {
  const context = useContext(CoreUserContext);

  if (!context) {
    throw new Error(
      "useCoreUser debe utilizarse dentro de CoreUserProvider."
    );
  }

  return context;
};


