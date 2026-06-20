
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";
import { motion, AnimatePresence } from "framer-motion";
import { User, Book, Star, FileText, Link, Download, Loader2, AlertCircle } from "lucide-react";


const StudentDashboardHome = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = UseAuth();
  const [expandedSession, setExpandedSession] = useState(null); // Track expanded accordion
  const [materialsForSession, setMaterialsForSession] = useState({});
  const [materialsLoading, setMaterialsLoading] = useState({});

  // Fetch student stats
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["studentStats", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/student/stats/${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  // Fetch booked sessions
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["studentBookings", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/bookings/student/${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  // Fetch materials for a session
  const fetchMaterials = async (sessionId) => {
    if (!sessionId) return;
    setMaterialsLoading((prev) => ({ ...prev, [sessionId]: true }));
    try {
      const res = await axiosSecure.get(`/materials/session/${sessionId}`);
      setMaterialsForSession((prev) => ({ ...prev, [sessionId]: res.data || [] }));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.response?.data?.message || err.message,
        customClass: { confirmButton: "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white" },
      });
      setMaterialsForSession((prev) => ({ ...prev, [sessionId]: [] }));
    } finally {
      setMaterialsLoading((prev) => ({ ...prev, [sessionId]: false }));
    }
  };

  // Toggle accordion
  const toggleAccordion = (sessionId) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
    } else {
      setExpandedSession(sessionId);
      if (!materialsForSession[sessionId]) {
        fetchMaterials(sessionId);
      }
    }
  };

  // Format date with fallback
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Loading state
  if (statsLoading || bookingsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-16 h-16 text-indigo-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* === HEADER === */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="relative"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-20 rounded-2xl"></div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
                Welcome, {user?.displayName || "Student"}
              </h1>
              <p className="text-lg text-gray-600 mt-2">Explore your bookings and study materials</p>
            </div>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.scrollTo({ top: 9999, behavior: "smooth" })}
                className="btn bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg flex items-center gap-2"
              >
                <FileText className="w-4 h-4" /> Create Note
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById("my-notes-section")?.scrollIntoView({ behavior: "smooth" })}
                className="btn bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg flex items-center gap-2"
              >
                <Book className="w-4 h-4" /> My Notes
              </motion.button>
            </div>
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full"
          />
        </motion.header>

        {/* === STATS === */}
        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { icon: Book, label: "Bookings", value: stats?.totalBookings ?? 0 },
            { icon: Star, label: "Reviews Given", value: stats?.totalReviews ?? 0 },
            { icon: FileText, label: "Materials Available", value: stats?.totalMaterials ?? 0 },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              whileHover={{ scale: 1.05 }}
              className="bg-gradient-to-br from-white to-indigo-50 rounded-xl shadow-lg p-6 border border-indigo-100 text-center"
            >
              <div className="flex justify-center mb-2">
                <stat.icon className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
              <div className="text-2xl font-bold text-indigo-700">{stat.value}</div>
            </motion.div>
          ))}
        </section>

        {/* === BOOKED SESSIONS WITH MATERIALS === */}
        <section className="relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg p-6 border border-indigo-100"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Book className="w-6 h-6 text-indigo-600" /> Your Booked Sessions
            </h2>
            {bookings.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">You have no bookings yet.</p>
              </div>
            ) : (
              <div className="relative space-y-6">
                {/* Timeline Line */}
                <div className="absolute left-4 md:left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                {bookings.map((b, idx) => {
                  const session = b.session || b.sessionData || (b.sessionId ? { _id: b.sessionId, title: b.title } : null);
                  const sessionId = session?._id?.toString?.() ?? b.sessionId;
                  return (
                    <motion.div
                      key={b._id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative pl-12"
                    >
                      {/* Timeline Dot */}
                      <div className="absolute left-2 md:left-4 top-4 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white"></div>
                      <div className="bg-white rounded-lg shadow-md p-4 border border-indigo-100">
                        {/* Session Header */}
                        <div
                          className="flex items-center justify-between cursor-pointer"
                          onClick={() => toggleAccordion(sessionId)}
                        >
                          <div className="font-semibold text-gray-800">{session?.title || "Unknown Session"}</div>
                          <motion.div
                            animate={{ rotate: expandedSession === sessionId ? 180 : 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </motion.div>
                        </div>
                        {/* Session Details */}
                        <div className="text-sm text-gray-600 mt-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" /> Tutor: {session?.tutorName || b.tutorEmail || "N/A"}
                          </div>
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Fee: {session?.registrationFee === 0 ? "Free" : `$${session?.registrationFee}` || "N/A"}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <FileText className="w-4 h-4" /> Reg: {formatDate(session?.registrationStart)} → {formatDate(session?.registrationEnd)}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Link to={`/dashboard/student/bookings/${session?._id}`}>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="btn btn-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg flex items-center gap-1"
                            >
                              <FileText className="w-4 h-4" /> View Details
                            </motion.button>
                          </Link>
                        </div>
                        {/* Materials Accordion */}
                        <AnimatePresence>
                          {expandedSession === sessionId && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="mt-4 space-y-4"
                            >
                              {materialsLoading[sessionId] ? (
                                <div className="flex justify-center py-4">
                                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                </div>
                              ) : materialsForSession[sessionId]?.length === 0 ? (
                                <div className="text-center py-4">
                                  <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                  <p className="text-gray-500">No materials available for this session.</p>
                                </div>
                              ) : (
                                materialsForSession[sessionId]?.map((m) => (
                                  <motion.div
                                    key={m._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-gradient-to-br from-white to-indigo-50 rounded-lg p-4 border border-indigo-100"
                                  >
                                    <div className="font-semibold text-gray-800">{m.title || "Untitled"}</div>
                                    <div className="text-sm text-gray-600 mb-2">{m.description || "No description"}</div>
                                    {m.image && (
                                      <div className="mb-2">
                                        <img src={m.image} alt={m.title || "Untitled"} className="w-full h-32 rounded-md object-cover" />
                                        <a
                                          href={m.image}
                                          target="_blank"
                                          rel="noreferrer"
                                          download
                                          className="btn btn-sm btn-outline mt-2 flex items-center gap-1"
                                        >
                                          <Download className="w-4 h-4" /> Download Image
                                        </a>
                                      </div>
                                    )}
                                    {m.fileUrl && (
                                      <div className="flex gap-2">
                                        <a
                                          href={m.fileUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="btn btn-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg flex items-center gap-1"
                                        >
                                          <Link className="w-4 h-4" /> Open File
                                        </a>
                                        <a
                                          href={m.fileUrl}
                                          download
                                          className="btn btn-sm btn-outline flex items-center gap-1"
                                        >
                                          <Download className="w-4 h-4" /> Download
                                        </a>
                                      </div>
                                    )}
                                  </motion.div>
                                ))
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </section>
      </div>
    </div>
  );
};

export default StudentDashboardHome;
