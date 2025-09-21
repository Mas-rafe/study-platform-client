
import { useContext } from "react";
import { AuthContext } from "../Contexts/AuthContext";


const UseAuth = () => {
  const { user, role, loading } = useContext(AuthContext);

  return {
    user,
    role,
    loading,
    email: user?.email || null,   // ✅ ensure email is included
  };
};

export default UseAuth;
