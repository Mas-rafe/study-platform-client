import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../../Hooks/UseAuth";
import { Link } from "react-router";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import { BookOpen, FileText, Users, Star, PlusCircle, Upload, Calendar, DollarSign, AlertCircle, Clock } from "lucide-react";

const CountUp = ({ end, duration = 2, decimals = 0 }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Number(latest.toFixed(decimals)));

  useEffect(() => {
    const controls = animate(count, end, { duration, ease: "easeOut" });
    return controls.stop;
  }, [count, end, duration]);

  return <motion.span>{rounded}</motion.span>;
};

const TutorDashboardHome = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = UseAuth();

  const { data: stats = {}, isLoading, error } = useQuery({
    queryKey: ["tutorStats", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/tutor/stats/${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email,
    onError: (err) => {
      console.error("Tutor stats error:", err);
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full"></div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-500">
        Error loading stats: {error.message}
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Sessions",
      value: stats.totalSessions || 0,
      icon: BookOpen,
      gradient: "from-indigo-400 to-blue-500",
      color: "text-blue-600",
    },
    {
      title: "Materials Uploaded",
      value: stats.totalMaterials || 0,
      icon: FileText,
      gradient: "from-green-400 to-emerald-500",
      color: "text-green-600",
    },
    {
      title: "My Students",
      value: stats.totalStudents || 0,
      icon: Users,
      gradient: "from-purple-400 to-pink-500",
      color: "text-purple-600",
    },
    {
      title: "Average Rating",
      value: stats.avgRating || 0,
      icon: Star,
      gradient: "from-amber-400 to-red-500",
      color: "text-amber-600",
      suffix: "/10",
      decimals: 1,
    },
    {
      title: "Total Revenue",
      value: stats.totalRevenue || 0,
      icon: DollarSign,
      gradient: "from-yellow-400 to-orange-500",
      color: "text-yellow-600",
      prefix: "$",
    },
    {
      title: "Pending Actions",
      value: (stats.pending || 0) + (stats.pendingBookings || 0),
      icon: AlertCircle,
      gradient: "from-red-400 to-rose-500",
      color: "text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* === HEADER === */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="text-center relative"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-30 rounded-3xl"></div>
          </div>
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 drop-shadow-lg"
          >
            Welcome Back, {user?.displayName || "Tutor"}!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 mt-3 font-medium"
          >
            Your teaching journey continues — here's your latest activity
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-indigo-500 to-pink-500 mx-auto mt-4 rounded-full"
          />
        </motion.div>

        {/* === STATS GRID === */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15, type: "spring", stiffness: 80 }}
              whileHover={{ y: -6, scale: 1.03 }}
              className="group"
            >
              <div
                className={`bg-gradient-to-r ${card.gradient} text-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-4 h-full border border-white border-opacity-20`}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.1 + 0.3, type: "spring" }}
                  className="p-3 bg-opacity-25 rounded-xl group-hover:scale-110 transition-transform"
                >
                  {(() => {
                    const Icon = card.icon;
                    return <Icon size={32} />;
                  })()}
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-sm md:text-base font-medium opacity-90">{card.title}</h3>
                  <p className="text-3xl md:text-4xl font-extrabold mt-2 flex items-baseline">
                    {card.prefix && <span className="text-xl mr-1">{card.prefix}</span>}
                    <CountUp end={card.value} duration={2.5} decimals={card.decimals || 0} />
                    {card.suffix && <span className="text-lg ml-1 opacity-80">{card.suffix}</span>}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* === QUICK ACTIONS === */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <PlusCircle className="text-indigo-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Add New Session", icon: PlusCircle, color: "indigo", link: "/dashboard/add-session" },
              { label: "Upload Material", icon: Upload, color: "green", link: "/dashboard/tutor-materials" },
              { label: "My Sessions", icon: Calendar, color: "blue", link: "/dashboard/my-sessions" },
              { label: "My Reviews", icon: Star, color: "yellow", link: "/dashboard/my-reviews" },
            ].map((action, idx) => (
              <motion.div
                key={action.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link
                  to={action.link}
                  className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 border-${action.color}-200 bg-${action.color}-50 hover:bg-${action.color}-100 transition-all cursor-pointer group h-full`}
                >
                  {(() => {
                    const Icon = action.icon;
                    return <Icon className={`w-10 h-10 text-${action.color}-600 mb-2 group-hover:scale-110 transition-transform`} />;
                  })()}
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-${action.color}-700">
                    {action.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* === RECENT ACTIVITY === */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Clock className="text-purple-600" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {[
              { icon: BookOpen, text: `${stats.totalSessions || 0} sessions created`, color: "text-indigo-600" },
              { icon: FileText, text: `${stats.totalMaterials || 0} materials uploaded`, color: "text-green-600" },
              { icon: Users, text: `${stats.totalStudents || 0} students enrolled`, color: "text-blue-600" },
              { icon: Star, text: `Average rating: ${stats.avgRating?.toFixed(1) || 0} stars`, color: "text-yellow-600" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="text-sm text-gray-700 font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* === FOOTER === */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-gray-500"
        >
          <p>Last updated: {new Date().toLocaleString()}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default TutorDashboardHome;