




import { Outlet } from "react-router";
import { useContext, useState } from "react";
import Navbar from "../Components/Navbar";
import { AuthContext } from "../Contexts/AuthContext";

const RootLayout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { darkMode } = useContext(AuthContext);
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${darkMode ? "bg-gray-900 text-white" : "bg-white text-black"
        }`}
    >
      <Navbar onDashboardClick={() => setIsDrawerOpen(true)} />

      <Outlet />

      {/* <Footer /> */}
    </div>
  );
};

export default RootLayout;
