import { Link, Outlet } from "react-router";

const DashboardLayout = () => {
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
  <div className="drawer-side mt-[64px] lg:mt-0"> {/* 👈 Adjust mt to match navbar height */}
    <label htmlFor="dashboard-drawer" className="drawer-overlay"></label>
    <ul className="menu p-4 w-72 min-h-full bg-base-200 text-base-content overflow-y-auto">
      <li><Link to="/dashboard/student">Student Dashboard</Link></li>
      <li><Link to="/dashboard/teacher">Teacher Dashboard</Link></li>
      <li><Link to="/dashboard/admin">Admin Dashboard</Link></li>
      <li><Link to="/dashboard/study-sessions">Study-Sessions(tutor tool)</Link></li>
      <li><Link to="/dashboard/my-sessions">My Sessions</Link></li>
    </ul>
  </div>
</div>

    );
};

export default DashboardLayout;
