
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";


const AdminDashboard = () => {
  const axiosSecure = useAxiosSecure();

  const { data: stats = {} } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await axiosSecure.get("/admin/stats");
      return res.data;
    },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-base-100 shadow-xl p-6">
          <h3 className="text-lg font-semibold">Total Users</h3>
          <p className="text-3xl font-bold">{stats.totalUsers || 0}</p>
        </div>
        <div className="card bg-base-100 shadow-xl p-6">
          <h3 className="text-lg font-semibold">Total Sessions</h3>
          <p className="text-3xl font-bold">{stats.totalSessions || 0}</p>
          <p className="text-sm text-gray-500">
            Pending: {stats.pending || 0}, Approved: {stats.approved || 0}, Rejected: {stats.rejected || 0}
          </p>
        </div>
        <div className="card bg-base-100 shadow-xl p-6">
          <h3 className="text-lg font-semibold">Total Materials</h3>
          <p className="text-3xl font-bold">{stats.totalMaterials || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
