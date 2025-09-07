// src/components/Navbar/Navbar.jsx


import Swal from "sweetalert2";

import { Link, Links, NavLink } from "react-router";
import { useContext } from "react";
import { AuthContext } from "../Contexts/AuthContext";

const Navbar = () => {
  const { user, logOut } = useContext(AuthContext);

  const handleLogOut = async () => {
    try {
      await logOut();
      Swal.fire({
        icon: "success",
        title: "Logged out successfully",
        toast: true,
        position: "top-end",
        timer: 1800,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Logout failed",
        text: err.message || "Please try again",
      });
    }
  };

  const linkClass = ({ isActive }) =>
    isActive ? "text-primary font-semibold" : "hover:text-primary/80";

  const navItems = (
    <>
      <li><NavLink to="/" className={linkClass}>Home</NavLink></li>
      <li><NavLink to="/sessions" className={linkClass}>Study Sessions</NavLink></li>
      <li><NavLink to="/tutors" className={linkClass}>Tutors</NavLink></li>
      {/* Optional public route */}
      {/* <li><NavLink to="/announcements" className={linkClass}>Announcements</NavLink></li> */}
      <li><NavLink to="/about" className={linkClass}>About</NavLink></li>
      {user && (
        <li><NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink></li>
      )}
    </>
  );

  return (
    <div className="navbar bg-base-100 shadow-sm sticky top-0 z-50 px-4">
      {/* START */}
      <div className="navbar-start">
        {/* Mobile menu */}
        <div className="dropdown lg:hidden">
          <label tabIndex={0} className="btn btn-ghost" aria-label="Open menu">
            <svg
              xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-56 z-[60]"
          >
            {navItems}
            <div className="mt-2 border-t pt-2">
              {user ? (
                <button onClick={handleLogOut} className="btn btn-primary w-full">Log out</button>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" className="btn btn-primary flex-1">Login</Link>
                  <Link to="/register" className="btn btn-outline flex-1">Register</Link>
                </div>
              )}
            </div>
          </ul>
        </div>

        {/* Logo + brand */}
        <Link to="/" className="flex items-center gap-2">
        
          {/* <StudyLogo /> */}
          <span className="text-lg md:text-2xl font-bold">StudyHub</span>
        </Link>
      </div>

      {/* CENTER (desktop menu) */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal gap-1">{navItems}</ul>
      </div>

      {/* END */}
      <div className="navbar-end gap-2">
        {user ? (
          <>
            {/* Avatar dropdown */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-9 rounded-full">
                  <img
                    alt="profile"
                    src={
                      user.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user.displayName || user.email || "U"
                      )}`
                    }
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-56 z-[60]"
              >
                <li className="px-2 py-1 text-xs opacity-70">{user.email}</li>
                <li><NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink></li>
                <li><button onClick={handleLogOut} className="text-error">Log out</button></li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-primary">Login</Link>
            <Link to="/register" className="btn btn-outline">Register</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
