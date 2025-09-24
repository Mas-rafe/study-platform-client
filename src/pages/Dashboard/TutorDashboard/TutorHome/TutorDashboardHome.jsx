import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../../Hooks/UseAuth";
import { Link } from "react-router";


const TutorDashboardHome = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = UseAuth();

  // Fetch tutor stats
  const { data: stats = {} } = useQuery({
    queryKey: ["tutorStats", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/tutor/stats/${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold">
        Welcome back, {user?.displayName || "Tutor"} 👋
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card bg-blue-100 p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold">Total Sessions</h3>
          <p className="text-3xl font-bold">{stats.totalSessions || 0}</p>
        </div>
        <div className="card bg-green-100 p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold">Materials Uploaded</h3>
          <p className="text-3xl font-bold">{stats.totalMaterials || 0}</p>
        </div>
        <div className="card bg-purple-100 p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold">My Students</h3>
          <p className="text-3xl font-bold">{stats.totalStudents || 0}</p>
        </div>
        <div className="card bg-yellow-100 p-6 rounded-2xl shadow">
          <h3 className="text-lg font-semibold">Average Rating</h3>
          <p className="text-3xl font-bold">{stats.avgRating?.toFixed(1) || "N/A"}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 justify-center">
       <Link to={"/dashboard/add-session"}> <button className="btn btn-primary">➕ Add New Session</button></Link>
        <Link to={"/dashboard/tutor-materials"}><button className="btn btn-secondary">📘 Upload Material</button></Link>
      </div>
    </div>
  );
};

export default TutorDashboardHome;
