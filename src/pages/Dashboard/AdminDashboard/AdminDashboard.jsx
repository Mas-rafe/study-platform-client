import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";
import {
  Users,
  BookOpen,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Calendar,
  DollarSign,
} from "lucide-react";
import { Link } from "react-router";

const CountUp = ({ end, duration = 2 }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, end, {
      duration,
      ease: "easeOut",
    });
    return controls.stop;
  }, [count, end, duration]);

  return <motion.span>{rounded}</motion.span>;
};

const AdminDashboard = () => {
  const axiosSecure = useAxiosSecure();

  const { data: stats = {}, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await axiosSecure.get("/admin/stats");
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
        </motion.div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers || 0,
      icon: Users,
      gradient: "from-blue-500 to-cyan-600",
      color: "text-blue-600",
    },
    {
      title: "Total Sessions",
      value: stats.totalSessions || 0,
      icon: BookOpen,
      gradient: "from-green-500 to-emerald-600",
      color: "text-green-600",
      extra: `Pending: ${stats.pending || 0} | Approved: ${stats.approved || 0} | Rejected: ${stats.rejected || 0}`,
    },
    {
      title: "Total Materials",
      value: stats.totalMaterials || 0,
      icon: FileText,
      gradient: "from-purple-500 to-pink-600",
      color: "text-purple-600",
    },
    {
      title: "Total Revenue",
      value: stats.totalRevenue || 0,
      icon: DollarSign,
      gradient: "from-yellow-500 to-orange-600",
      color: "text-yellow-600",
      prefix: "$",
    },
    {
      title: "Avg. Rating",
      value: stats.avgRating || 0,
      icon: Star,
      gradient: "from-amber-400 to-red-600",
      color: "text-amber-600",
      suffix: " Stars",
      decimal: true,
    },
    {
      title: "Pending Actions",
      value: (stats.pending || 0) + (stats.pendingBookings || 0),
      icon: AlertCircle,
      gradient: "from-red-500 to-rose-600",
      color: "text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-10">

        {/* === FANCY HEADER === */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="text-center relative"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-30"></div>
          </div>
          <motion.h1
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 drop-shadow-lg"
          >
            Admin Dashboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-600 mt-3 font-medium"
          >
            Real-time insights & platform control center
          </motion.p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-indigo-500 to-pink-500 mx-auto mt-4 rounded-full"
          />
        </motion.div>

        {/* === STATS GRID (NO CLICK) === */}
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
                  {card.icon && (() => {
                    const IconComponent = card.icon;
                    return <IconComponent size={32} />;
                  })()}
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-sm md:text-base font-medium opacity-90">{card.title}</h3>
                  <p className="text-3xl md:text-4xl font-extrabold mt-2 flex items-baseline">
                    {card.prefix && <span className="text-xl mr-1">{card.prefix}</span>}
                    <CountUp
                      end={card.decimal ? parseFloat(card.value.toFixed(1)) : card.value}
                      duration={2.5}
                    />
                    {card.suffix && <span className="text-lg ml-1 opacity-80">{card.suffix}</span>}
                  </p>
                  {card.extra && <p className="text-xs opacity-80 mt-2">{card.extra}</p>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* === QUICK ACTIONS (STANDARD) === */}
       <motion.section
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.8 }}
  className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
>
  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
    <TrendingUp className="text-indigo-600" />
    Quick Navigation
  </h2>
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[
      { label: "Users", icon: Users, color: "indigo", to: "/dashboard/manage-users" },
      { label: "Sessions", icon: BookOpen, color: "green", to: "/dashboard/manage-sessions" },
      { label: "Bookings", icon: Calendar, color: "blue", to: "/dashboard/manage-bookings" },
      { label: "Reviews", icon: Star, color: "yellow", to: "/dashboard/manage-reviews" },
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
          to={action.to}
          className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 border-${action.color}-200 bg-${action.color}-50 hover:bg-${action.color}-100 transition-all cursor-pointer group`}
        >
          <action.icon className={`w-9 h-9 text-${action.color}-600 mb-2 group-hover:scale-110 transition-transform`} />
          <span className="text-sm font-semibold text-gray-700 group-hover:text-${action.color}-700 transition-colors">
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
          transition={{ delay: 0.9 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Clock className="text-purple-600" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {[
              { icon: CheckCircle, text: `${stats.approved || 0} sessions approved today`, color: "text-green-600" },
              { icon: XCircle, text: `${stats.rejected || 0} sessions rejected`, color: "text-red-600" },
              { icon: AlertCircle, text: `${stats.pending || 0} sessions awaiting review`, color: "text-yellow-600" },
              { icon: Users, text: `${stats.newUsers || 0} new users this week`, color: "text-indigo-600" },
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 + 0.3 }}
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
          transition={{ delay: 1 }}
          className="text-center text-sm text-gray-500"
        >
          <p>Last updated: {new Date().toLocaleString()}</p>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;