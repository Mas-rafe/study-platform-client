
import { Outlet } from "react-router";

import Footer from "../Components/Footer";
import Navbar from "../Components/Navbar";


const RootLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default RootLayout;
