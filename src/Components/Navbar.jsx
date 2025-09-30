import Swal from "sweetalert2";
import { useContext } from "react";
import { AuthContext } from "../Contexts/AuthContext";
import { Link, NavLink } from "react-router";

const Navbar = ({ onDashboardClick }) => {
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

  // 🔹 Custom navlink style
  const linkClass = ({ isActive }) =>
    `relative px-3 py-2 rounded-md transition-all duration-300 
     ${isActive
        ? "text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md"
        : "text-gray-700 hover:text-indigo-600 hover:after:w-full"
     }
     after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 
     after:bg-gradient-to-r after:from-indigo-500 after:to-purple-500 
     after:transition-all after:duration-300 hover:after:w-full`;

  const navItems = (
    <>
      <li><NavLink to="/" className={linkClass}>Home</NavLink></li>
      <li><NavLink to="/study-sessions" className={linkClass}>Study Sessions</NavLink></li>
      <li><NavLink to="/tutors" className={linkClass}>Tutors</NavLink></li>
      <li><NavLink to="/about" className={linkClass}>About</NavLink></li>
      {user && (
        <li>
          <Link to="/dashboard" className="relative px-3 py-2 rounded-md text-gray-700 hover:text-indigo-600 hover:after:w-full after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-indigo-500 after:to-purple-500 after:transition-all after:duration-300">
            Dashboard
          </Link>
        </li>
      )}
    </>
  );

  return (
    <div className="navbar sticky top-0 z-50 shadow-md bg-gradient-to-r from-indigo-50 to-purple-50 px-4">
      {/* START */}
      <div className="navbar-start">
        {/* Mobile menu */}
        <div className="dropdown lg:hidden">
          <label tabIndex={0} className="btn btn-ghost" aria-label="Open menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6"
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-white rounded-box w-56 z-[60]"
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

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
            StudyHub
          </span>
        </Link>
      </div>

      {/* CENTER (desktop menu) */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal gap-2">{navItems}</ul>
      </div>

      {/* END */}
      <div className="navbar-end gap-2">
        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-9 rounded-full ring-2 ring-indigo-400">
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
              className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-white rounded-box w-56 z-[60]"
            >
              <li className="px-2 py-1 text-xs opacity-70">{user.email}</li>
              <li><button onClick={onDashboardClick}>Dashboard</button></li>
              <li><button onClick={handleLogOut} className="text-error">Log out</button></li>
            </ul>
          </div>
        ) : (
          <>
            <Link to="/login" className="btn bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none hover:scale-105 transition">Login</Link>
            <Link to="/register" className="btn btn-outline hover:border-indigo-500 hover:text-indigo-600">Register</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
