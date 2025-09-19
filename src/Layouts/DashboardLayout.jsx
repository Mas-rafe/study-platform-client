import { Link, Outlet } from "react-router";
import UseAuth from "../Hooks/UseAuth";

const DashboardLayout = () => {
  const { role } = UseAuth(); // "admin" | "tutor" | "student"

  return (
    <div className="drawer lg:drawer-open">
      <input id="dashboard-drawer" type="checkbox" className="drawer-toggle" />

      {/* Page content */}
      <div className="drawer-content flex flex-col">
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
      <div className="drawer-side mt-[64px] lg:mt-0">
        <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>
        <ul className="menu p-4 w-72 min-h-full bg-base-200 text-base-content overflow-y-auto space-y-2">
          
          {/* Student Menu */}
          {role === "student" && (
            <>
              <li><Link to="/dashboard/student">Student Dashboard</Link></li>
              <li><Link to="/dashboard/my-bookings">My Bookings</Link></li>
              <li><Link to="/dashboard/my-reviews">My Reviews</Link></li>
              <li><Link to="/dashboard/my-notes">My Notes</Link></li>
            </>
          )}

          {/* Tutor Menu */}
          {role === "tutor" && (
            <>
              <li><Link to="/dashboard/tutor">Tutor Dashboard</Link></li>
              <li><Link to="/dashboard/add-session">Add Session</Link></li>
              <li><Link to="/dashboard/my-sessions">My Sessions</Link></li>
              <li><Link to="/dashboard/my-materials">My Materials</Link></li>
            </>
          )}

          {/* Admin Menu */}
          {role === "admin" && (
            <>
              <li><Link to="/dashboard/admin">Admin Dashboard</Link></li>

              <li><Link to="/dashboard/manage-sessions">Manage Sessions</Link></li>
              <li><Link to="/dashboard/manage-users">Manage Users</Link></li>
              <li><Link to="/dashboard/manage-reviews">Manage Reviews</Link></li>
              <li><Link to="/dashboard/manage-materials">Manage Materials</Link></li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DashboardLayout;
