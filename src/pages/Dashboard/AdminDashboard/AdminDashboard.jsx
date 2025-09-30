import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import { Users, BookOpen, FileText } from "lucide-react"; // ✅ nice icons

const AdminDashboard = () => {
  const axiosSecure = useAxiosSecure();

  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await axiosSecure.get("/admin/stats");
      return res.data;
    },
  });

  if (isLoading) return <p className="text-center mt-10">Loading stats...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white p-6 rounded-xl shadow flex items-center gap-4">
          <Users size={40} />
          <div>
            <h3 className="text-lg font-semibold">Total Users</h3>
            <p className="text-3xl font-bold">{stats.totalUsers || 0}</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-xl shadow flex items-center gap-4">
          <BookOpen size={40} />
          <div>
            <h3 className="text-lg font-semibold">Total Sessions</h3>
            <p className="text-3xl font-bold">{stats.totalSessions || 0}</p>
            <p className="text-sm">
              Pending: {stats.pending || 0}, Approved: {stats.approved || 0}, Rejected: {stats.rejected || 0}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 rounded-xl shadow flex items-center gap-4">
          <FileText size={40} />
          <div>
            <h3 className="text-lg font-semibold">Total Materials</h3>
            <p className="text-3xl font-bold">{stats.totalMaterials || 0}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
