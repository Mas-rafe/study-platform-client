import { Link, Outlet } from "react-router";
import UseAuth from "../Hooks/UseAuth";
import {
  FaBook,
  FaChalkboardTeacher,
  FaUserGraduate,
  FaUsers,
  FaClipboardList,
  FaRegStickyNote,
  FaFolderOpen,
  FaStar,
 
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { HiPencilAlt } from "react-icons/hi";

const DashboardLayout = () => {
  const { role } = UseAuth(); // "admin" | "tutor" | "student"

  return (
    <div className="drawer lg:drawer-open">
      
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

      {/* Page content */}
      <div className="drawer-content flex flex-col pt-20">
        <label
          htmlFor="dashboard-drawer"
          className="btn btn-primary drawer-button lg:hidden mt-2 ml-2"
        >
          Open Dashboard
        </label>

        <div className="p-6">
          <Outlet />
        </div>
      </div>

      {/* Sidebar content */}
      <div className="drawer-side mt-[64px]  lg:mt-0">
        <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>
        <ul className="menu p-4 w-72 min-h-full 
          bg-gradient-to-b from-indigo-100 via-purple-100 to-pink-100 
          text-gray-800 font-medium overflow-y-auto space-y-2 rounded-r-2xl shadow-lg">
          
          {/* Student Menu */}
          {role === "student" && (
            <>
              <li>
                <Link to="/dashboard/student" className="flex items-center gap-2 hover:bg-indigo-200 rounded-lg p-2 transition">
                  <MdDashboard /> Student Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/my-bookings" className="flex items-center gap-2 hover:bg-indigo-200 rounded-lg p-2 transition">
                  <FaClipboardList /> My Bookings
                </Link>
              </li>
              <li>
                <Link to="/dashboard/create-note" className="flex items-center gap-2 hover:bg-indigo-200 rounded-lg p-2 transition">
                  <FaRegStickyNote /> Create Notes
                </Link>
              </li>
              <li>
                <Link to="/dashboard/my-notes" className="flex items-center gap-2 hover:bg-indigo-200 rounded-lg p-2 transition">
                  <FaBook /> My Notes
                </Link>
              </li>
              <li>
                <Link to="/dashboard/my-materials" className="flex items-center gap-2 hover:bg-indigo-200 rounded-lg p-2 transition">
                  <FaFolderOpen /> My Study Materials
                </Link>
              </li>
            </>
          )}

          {/* Tutor Menu */}
          {role === "tutor" && (
            <>
              <li>
                <Link to="/dashboard/tutor" className="flex items-center gap-2 hover:bg-purple-200 rounded-lg p-2 transition">
                  <MdDashboard /> Tutor Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/add-session" className="flex items-center gap-2 hover:bg-purple-200 rounded-lg p-2 transition">
                  <FaChalkboardTeacher /> Add Session
                </Link>
              </li>
              <li>
                <Link to="/dashboard/my-sessions" className="flex items-center gap-2 hover:bg-purple-200 rounded-lg p-2 transition">
                  <FaClipboardList /> My Sessions
                </Link>
              </li>
              <li>
                <Link to="/dashboard/tutor-materials" className="flex items-center gap-2 hover:bg-purple-200 rounded-lg p-2 transition">
                  <FaFolderOpen /> Upload Materials
                </Link>
              </li>
              <li>
                <Link to="/dashboard/my-material" className="flex items-center gap-2 hover:bg-purple-200 rounded-lg p-2 transition">
                  <FaBook /> My Uploaded Materials
                </Link>
              </li>
            </>
          )}

          {/* Admin Menu */}
          {role === "admin" && (
            <>
              <li>
                <Link to="/dashboard/admin" className="flex items-center gap-2 hover:bg-pink-200 rounded-lg p-2 transition">
                  <MdDashboard /> Admin Dashboard
                </Link>
              </li>
              <li>
                <Link to="/dashboard/manage-sessions" className="flex items-center gap-2 hover:bg-pink-200 rounded-lg p-2 transition">
                  <FaClipboardList /> Manage Sessions
                </Link>
              </li>
              <li>
                <Link to="/dashboard/manage-bookings" className="flex items-center gap-2 hover:bg-pink-200 rounded-lg p-2 transition">
                  <HiPencilAlt /> Manage Bookings
                </Link>
              </li>
              <li>
                <Link to="/dashboard/manage-users" className="flex items-center gap-2 hover:bg-pink-200 rounded-lg p-2 transition">
                  <FaUsers /> Manage Users
                </Link>
              </li>
              <li>
                <Link to="/dashboard/manage-reviews" className="flex items-center gap-2 hover:bg-pink-200 rounded-lg p-2 transition">
                  <FaStar /> Manage Reviews
                </Link>
              </li>
              <li>
                <Link to="/dashboard/manage-materials" className="flex items-center gap-2 hover:bg-pink-200 rounded-lg p-2 transition">
                  <FaFolderOpen /> Manage Materials
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
