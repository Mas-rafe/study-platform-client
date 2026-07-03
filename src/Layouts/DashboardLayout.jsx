import { Link, Outlet } from "react-router";
import UseAuth from "../Hooks/UseAuth";
import {
  FaBook,
  FaChalkboardTeacher,
  FaUsers,
  FaClipboardList,
  FaRegStickyNote,
  FaFolderOpen,
  FaStar,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { HiPencilAlt } from "react-icons/hi";

const DashboardLayout = () => {
  const { role } = UseAuth();

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200 text-base-content transition-colors duration-300">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main content */}
      <div className="drawer-content flex flex-col bg-base-200 text-base-content">
        <label
          htmlFor="dashboard-drawer"
          className="mt-20 btn btn-primary drawer-button lg:hidden ml-2"
        >
          Open Dashboard
        </label>

        <div className="p-6 lg:mt-10">
          <Outlet />
        </div>
      </div>

      {/* Sidebar */}
      <div className="drawer-side pt-20 h-screen lg:mt-0">
        <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>

        <ul className="menu p-4 w-72 min-h-full bg-base-100 text-base-content font-medium space-y-2 rounded-r-2xl shadow-lg border-r border-base-300 transition-colors duration-300">
          {/* STUDENT */}
          {role === "student" && (
            <>
              <li>
                <Link to="/dashboard/student">
                  <MdDashboard /> Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/my-bookings">
                  <FaClipboardList /> My Bookings
                </Link>
              </li>
              <li>
                <Link to="/dashboard/create-note">
                  <FaRegStickyNote /> Create Notes
                </Link>
              </li>
              <li>
                <Link to="/dashboard/my-notes">
                  <FaBook /> My Notes
                </Link>
              </li>
              <li>
                <Link to="/dashboard/my-materials">
                  <FaFolderOpen /> Study Materials
                </Link>
              </li>
            </>
          )}

          {/* TUTOR */}
          {role === "tutor" && (
            <>
              <li>
                <Link to="/dashboard/tutor">
                  <MdDashboard /> Tutor Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/add-session">
                  <FaChalkboardTeacher /> Add Session
                </Link>
              </li>
              <li>
                <Link to="/dashboard/my-sessions">
                  <FaClipboardList /> My Sessions
                </Link>
              </li>
              <li>
                <Link to="/dashboard/tutor-materials">
                  <FaFolderOpen /> Upload Materials
                </Link>
              </li>
            </>
          )}

          {/* ADMIN */}
          {role === "admin" && (
            <>
              <li>
                <Link to="/dashboard/admin">
                  <MdDashboard /> Admin Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/manage-sessions">
                  <FaClipboardList /> Manage Sessions
                </Link>
              </li>
              <li>
                <Link to="/dashboard/manage-bookings">
                  <HiPencilAlt /> Manage Bookings
                </Link>
              </li>
              <li>
                <Link to="/dashboard/manage-users">
                  <FaUsers /> Manage Users
                </Link>
              </li>
              <li>
                <Link to="/dashboard/manage-reviews">
                  <FaStar /> Manage Reviews
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DashboardLayout;