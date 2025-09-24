import { useContext } from "react";
import { AuthContext } from "../Contexts/AuthContext";


const UseAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("UseAuth must be used inside AuthProvider");
  }

  return context; // return everything from AuthProvider
};

export default UseAuth;