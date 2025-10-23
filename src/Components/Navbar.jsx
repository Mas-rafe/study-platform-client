import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../Contexts/AuthContext";

import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { HiMenuAlt1 } from "react-icons/hi";
import { Link, NavLink } from "react-router";

const Navbar = () => {
  const { user, logOut, darkMode, toggleTheme } = useContext(AuthContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // এই দুটো ref যোগ করুন
  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);

  // হ্যামবার্গার মেনু বন্ধ করার জন্য
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(event.target)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen]);

  const handleLogOut = async () => {
    try {
      await logOut();
      setProfileOpen(false);
      setMobileMenuOpen(false);
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
    `px-4 py-2 rounded-lg font-medium transition-all duration-300 ${isActive
      ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
      : "text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
    }`;

  const navItems = (
    <>
      <li><NavLink to="/" className={linkClass} end>Home</NavLink></li>
      <li><NavLink to="/study-sessions" className={linkClass}>Study Sessions</NavLink></li>
      <li><NavLink to="/tutors" className={linkClass}>Tutors</NavLink></li>
      <li><NavLink to="/about" className={linkClass}>About</NavLink></li>
      {user && <li><NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink></li>}
    </>
  );

  return (
    <>
      {/* Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 120 }}
        className={`fixed top-0 left-0 w-full z-50 shadow-lg ${darkMode ? "bg-gray-900" : "bg-white"
          } border-b border-gray-200 dark:border-gray-700`}
      >
        <div className="max-w-7xl mx-auto px-4 ">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link
              to="/"
              className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent"
            >
              StudyHub
            </Link>

            {/* Desktop Menu */}
            <ul className="hidden lg:flex items-center gap-2">{navItems}</ul>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                aria-label="Toggle theme"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>

              {/* User Profile / Login */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="flex items-center rounded-full overflow-hidden ring-2 ring-indigo-500 transition-all hover:ring-purple-500"
                  >
                    <img
                      src={
                        user.photoURL ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          user.displayName || user.email || "U"
                        )}&background=6366f1&color=fff`
                      }
                      alt="Profile"
                      className="w-10 h-10 object-cover"
                    />
                  </button>

                  {/* Dropdown */}
                  {profileOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2"
                    >
                      <li className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300 border-b dark:border-gray-700">
                        {user.email}
                      </li>
                      <li>
                        <Link
                          to="/dashboard"
                          className="block w-full text-left px-4 py-2.5 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-gray-700 transition"
                          onClick={() => setProfileOpen(false)}
                        >
                          Dashboard
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={handleLogOut}
                          className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                        >
                          Log out
                        </button>
                      </li>
                    </motion.ul>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-5 py-2 rounded-lg border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-500 hover:text-white transition-all duration-300"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
              ref={hamburgerRef}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
              >
                <HiMenuAlt1 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
          ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="lg:hidden border-t border-gray-200 dark:border-gray-700"
          >
            <ul className="px-4 py-3 space-y-2 bg-white dark:bg-gray-900">
              {navItems}
              {user ? (
                <button
                  onClick={handleLogOut}
                  className="w-full py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
                >
                  Log out
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block w-full text-center py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center py-2.5 rounded-lg border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </ul>
          </motion.div>
        )}
      </motion.nav>

      
    </>
  );
};

export default Navbar;