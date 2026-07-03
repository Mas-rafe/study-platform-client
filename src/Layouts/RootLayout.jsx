import { Outlet } from "react-router";
import { useState } from "react";
import Navbar from "../Components/Navbar";

const RootLayout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-base-100 text-base-content transition-colors duration-300">
      <Navbar onDashboardClick={() => setIsDrawerOpen(true)} />

      <Outlet />
    </div>
  );
};

export default RootLayout;