import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../Contexts/AuthContext";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { HiMenuAlt1 } from "react-icons/hi";
import { Link, NavLink, useLocation } from "react-router";
import {
  BookOpen,
  ChevronDown,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Moon,
  Sun,
  UserCircle,
  UserPlus,
  X,
} from "lucide-react";

const Navbar = () => {
  const { user, logOut, darkMode, toggleTheme } = useContext(AuthContext);

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const location = useLocation();

  const mobileMenuRef = useRef(null);
  const hamburgerRef = useRef(null);
  const profileRef = useRef(null);

  const userName =
    user?.displayName || user?.email?.split("@")[0] || "Student";

  const userPhoto =
    user?.photoURL ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      userName
    )}&background=6366f1&color=fff`;

  const navLinks = [
    {
      to: "/",
      label: "Home",
      icon: Home,
      end: true,
    },
    {
      to: "/study-sessions",
      label: "Study Sessions",
      icon: BookOpen,
      end: false,
    },
  ];

  if (user) {
    navLinks.push({
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      end: false,
    });
  }

  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

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

      if (
        profileOpen &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [mobileMenuOpen, profileOpen]);

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

  const desktopLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25"
        : "text-base-content/75 hover:text-indigo-600 hover:bg-base-200"
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
      isActive
        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
        : "text-base-content/75 hover:text-indigo-600 hover:bg-base-200"
    }`;

  return (
    <motion.nav
      initial={{ y: -90 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className="fixed top-0 left-0 w-full z-50 bg-base-100/90 text-base-content backdrop-blur-xl border-b border-base-300 shadow-sm transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 md:h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            aria-label="StudyHub Home"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-5 h-5" />
            </div>

            <div className="leading-tight">
              <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                StudyHub
              </h1>
              <p className="hidden sm:block text-[11px] text-base-content/50 -mt-1">
                Learn. Book. Grow.
              </p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-2 bg-base-200/70 border border-base-300 rounded-3xl p-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={desktopLinkClass}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-base-200 border border-base-300 text-base-content hover:text-indigo-600 hover:border-indigo-400 flex items-center justify-center transition-all duration-300"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* User Profile / Login */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-2xl bg-base-200 border border-base-300 hover:border-indigo-400 px-1.5 py-1.5 md:pr-3 transition-all duration-300"
                  aria-label="Open profile menu"
                >
                  <img
                    src={userPhoto}
                    alt="Profile"
                    className="w-9 h-9 rounded-xl object-cover"
                  />

                  <div className="hidden md:block text-left">
                    <p className="text-sm font-bold text-base-content max-w-[120px] truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-base-content/50">My Account</p>
                  </div>

                  <ChevronDown
                    className={`hidden md:block w-4 h-4 text-base-content/60 transition-transform duration-300 ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-72 bg-base-100 border border-base-300 rounded-3xl shadow-2xl overflow-hidden"
                    >
                      <div className="p-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                        <div className="flex items-center gap-3">
                          <img
                            src={userPhoto}
                            alt="Profile"
                            className="w-12 h-12 rounded-2xl object-cover border border-white/30"
                          />

                          <div className="min-w-0">
                            <p className="font-bold truncate">{userName}</p>
                            <p className="text-sm text-white/75 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 space-y-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-2xl text-base-content/80 hover:text-indigo-600 hover:bg-base-200 transition-all duration-300"
                        >
                          <LayoutDashboard className="w-5 h-5" />
                          Dashboard
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogOut}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300"
                        >
                          <LogOut className="w-5 h-5" />
                          Log out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  to="/login"
                  className="btn btn-sm h-11 px-5 rounded-2xl btn-outline border-indigo-500 text-indigo-600 hover:bg-indigo-500 hover:text-white"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>

                <Link
                  to="/register"
                  className="btn btn-sm h-11 px-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-md shadow-indigo-500/25"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              ref={hamburgerRef}
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-base-200 border border-base-300 text-indigo-600 hover:border-indigo-400 flex items-center justify-center transition-all duration-300"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <HiMenuAlt1 className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden border-t border-base-300 bg-base-100/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
              {user && (
                <div className="flex items-center gap-3 bg-base-200 border border-base-300 rounded-3xl p-4">
                  <img
                    src={userPhoto}
                    alt="Profile"
                    className="w-12 h-12 rounded-2xl object-cover"
                  />

                  <div className="min-w-0">
                    <p className="font-bold text-base-content truncate">
                      {userName}
                    </p>
                    <p className="text-sm text-base-content/55 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {navLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      end={item.end}
                      className={mobileLinkClass}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-base-300">
                {user ? (
                  <button
                    type="button"
                    onClick={handleLogOut}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5" />
                    Log out
                  </button>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-indigo-500 text-indigo-600 font-semibold hover:bg-indigo-500 hover:text-white transition-all duration-300"
                    >
                      <LogIn className="w-5 h-5" />
                      Login
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold"
                    >
                      <UserPlus className="w-5 h-5" />
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;