import { useState, useContext, useEffect } from "react";
import { Link, NavLink } from "react-router";
import { AuthContext } from "../Contexts/AuthContext";
import Swal from "sweetalert2";
import { FiSun, FiMoon } from "react-icons/fi";

const Navbar = ({ onDashboardClick }) => {
  const { user, logOut } = useContext(AuthContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

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

  // Toggle dark mode
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("#profileDropdown")) setProfileOpen(false);
      if (!e.target.closest("#mobileMenu")) setMobileMenuOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const linkClass = ({ isActive }) =>
    `relative px-3 py-2 rounded-md transition-all duration-300 
    ${
      isActive
        ? "text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md"
        : "text-gray-700 hover:text-indigo-600 hover:after:w-full"
    }
    after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 
    after:bg-gradient-to-r after:from-indigo-500 after:to-purple-500 
    after:transition-all after:duration-300 hover:after:w-full`;

  const navItems = (
    <>
      <li>
        <NavLink to="/" className={linkClass}>
          Home
        </NavLink>
      </li>
      <li>
        <NavLink to="/study-sessions" className={linkClass}>
          Study Sessions
        </NavLink>
      </li>
      <li>
        <NavLink to="/tutors" className={linkClass}>
          Tutors
        </NavLink>
      </li>
      <li>
        <NavLink to="/about" className={linkClass}>
          About
        </NavLink>
      </li>
      {user && (
        <li>
          <Link
            to="/dashboard"
            className="relative px-3 py-2 rounded-md text-gray-700 hover:text-indigo-600 hover:after:w-full after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-gradient-to-r after:from-indigo-500 after:to-purple-500 after:transition-all after:duration-300"
          >
            Dashboard
          </Link>
        </li>
      )}
    </>
  );

  return (
    <nav
      className="sticky top-0 z-50 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 shadow-md px-4 lg:px-8 py-4 flex items-center justify-between"
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <span className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
          StudyHub
        </span>
      </Link>

      {/* Desktop Menu */}
      <ul className="hidden lg:flex gap-2">{navItems}</ul>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
        </button>

        {/* User / Auth buttons */}
        {user ? (
          <div className="relative" id="profileDropdown">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center rounded-full overflow-hidden ring-2 ring-indigo-400"
            >
              <img
                src={
                  user.photoURL ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user.displayName || user.email || "U"
                  )}`
                }
                alt="profile"
                className="w-9 h-9 object-cover"
              />
            </button>

            {profileOpen && (
              <ul className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md py-1 z-50">
                <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">
                  {user.email}
                </li>
                <li>
                  <button
                    onClick={onDashboardClick}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Dashboard
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleLogOut}
                    className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Log out
                  </button>
                </li>
              </ul>
            )}
          </div>
        ) : (
          <div className="hidden lg:flex gap-2">
            <Link
              className="btn bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none hover:scale-105 transition"
              to="/login"
            >
              Login
            </Link>
            <Link
              className="btn btn-outline hover:border-indigo-500 hover:text-indigo-600"
              to="/register"
            >
              Register
            </Link>
          </div>
        )}

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden relative" id="mobileMenu">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {mobileMenuOpen && (
            <ul className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-800 shadow-lg rounded-md py-2 flex flex-col gap-1 z-50">
              {navItems}
              <div className="mt-2 border-t border-gray-200 dark:border-gray-700 pt-2 px-2">
                {user ? (
                  <button
                    onClick={handleLogOut}
                    className="btn btn-primary w-full"
                  >
                    Log out
                  </button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Link
                      to="/login"
                      className="btn btn-primary w-full"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="btn btn-outline w-full"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
