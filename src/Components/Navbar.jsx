import { useContext, useState } from "react";
import { AuthContext } from "../Contexts/AuthContext";
import { Link, NavLink } from "react-router";
import Swal from "sweetalert2";

const Navbar = ({ onDashboardClick }) => {
  const { user, logOut, darkMode, toggleTheme } = useContext(AuthContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    `px-3 py-2 rounded-md transition-all duration-300 ${
      isActive
        ? "text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md"
        : "text-gray-700 dark:text-gray-300 hover:text-indigo-600"
    }`;

  const navItems = (
    <>
      <li><NavLink to="/" className={linkClass}>Home</NavLink></li>
      <li><NavLink to="/study-sessions" className={linkClass}>Study Sessions</NavLink></li>
      <li><NavLink to="/tutors" className={linkClass}>Tutors</NavLink></li>
      <li><NavLink to="/about" className={linkClass}>About</NavLink></li>
      {user && <li><Link to="/dashboard" className={linkClass}>Dashboard</Link></li>}
    </>
  );

  return (
    <nav
      className={`sticky top-0 z-50 shadow-md px-4 py-2 flex items-center justify-between transition-colors ${
        darkMode ? "bg-gray-900" : "bg-indigo-50"
      }`}
    >
      <Link to="/" className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
        StudyHub
      </Link>

      <ul className="hidden lg:flex gap-4">{navItems}</ul>

      <div className="flex items-center gap-3">
        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {/* Auth / Profile */}
        {user ? (
          <div className="relative">
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
              <ul className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md py-1">
                <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">{user.email}</li>
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
            <Link className="btn bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-none hover:scale-105 transition" to="/login">
              Login
            </Link>
            <Link className="btn btn-outline hover:border-indigo-500 hover:text-indigo-600" to="/register">
              Register
            </Link>
          </div>
        )}

        <button className="lg:hidden p-2 rounded-md bg-gray-200 dark:bg-gray-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          ☰
        </button>
      </div>

      {mobileMenuOpen && (
        <ul className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 shadow-md py-2 flex flex-col gap-2 px-4 lg:hidden">
          {navItems}
          {user ? (
            <button onClick={handleLogOut} className="btn btn-primary w-full">Log out</button>
          ) : (
            <>
              <Link className="btn btn-primary w-full" to="/login">Login</Link>
              <Link className="btn btn-outline w-full" to="/register">Register</Link>
            </>
          )}
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
