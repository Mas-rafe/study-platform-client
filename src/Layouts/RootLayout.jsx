




import { Outlet } from "react-router";
import { useState } from "react";
import Navbar from "../Components/Navbar";

const RootLayout = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div>
      <Navbar onDashboardClick={() => setIsDrawerOpen(true)} />
    
      <Outlet />
      {/* <Footer /> */}
    </div>
  );
};

export default RootLayout;
