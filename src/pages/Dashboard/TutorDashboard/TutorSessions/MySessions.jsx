import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import UseAuth from "../../../../Hooks/UseAuth";
import useAxiosSecure from "../../../../Hooks/UseAxiosSecure";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Clock, DollarSign, AlertCircle, Calendar } from "lucide-react";

const MySessions = () => {
  const { user } = UseAuth();
  const axiosSecure = useAxiosSecure();

  // Fetch tutor sessions
  const { data: sessions = [], refetch, isLoading, error } = useQuery({
    queryKey: ["tutor-sessions", user?.email],
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/sessions/tutor/${user?.email}`);
      return data;
    },
    enabled: !!user?.email,
  });

  // Resubmit a rejected session
  const handleResubmit = async (id) => {
    try {
      const { data } = await axiosSecure.patch(`/sessions/${id}/resubmit`);
      if (data.modifiedCount > 0) {
        Swal.fire({
          icon: "success",
          title: "Resubmitted!",
          text: "Your session is pending approval again.",
          customClass: { confirmButton: "btn btn-success bg-gradient-to-r from-green-500 to-emerald-600 text-white" },
          timer: 2000,
        });
        refetch();
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response?.data?.message || "Failed to resubmit session.",
        customClass: { confirmButton: "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white" },
      });
    }
  };

  // Format dates with fallback
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return (
          <span className="badge badge-success badge-lg font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="badge badge-error badge-lg font-medium flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case "pending":
        return (
          <span className="badge badge-warning badge-lg font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      default:
        return <span className="badge badge-ghost">Unknown</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
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
      <div className="text-center py-16 text-red-500 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <AlertCircle className="w-16 h-16 mx-auto mb-4" />
        <p>Error loading sessions: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* === HEADER === */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="text-center relative"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-20 rounded-2xl"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            My Study Sessions
          </h2>
          <p className="text-lg text-gray-600 mt-2">Manage your created study sessions</p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full"
          />
        </motion.div>

        {/* === SESSIONS === */}
        {sessions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg"
          >
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No sessions found.</p>
          </motion.div>
        ) : (
          <>
            {/* Desktop: Table View */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="hidden md:block bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="flex justify-end p-1 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="w-16 h-1 bg-indigo-300 rounded-full animate-pulse"></div>
              </div>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                      <th className="text-left">#</th>
                      <th className="text-left">Title</th>
                      <th className="text-left">Status</th>
                      <th className="text-center">Reg. Fee</th>
                      <th className="text-center">Duration</th>
                      <th className="text-center">Dates</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map((session, idx) => (
                      <motion.tr
                        key={session._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-indigo-50 transition-colors border-b"
                      >
                        <td className="font-medium">{idx + 1}</td>
                        <td>
                          <div className="flex items-center gap-3">
                            {session.image ? (
                              <img src={session.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <div className="bg-gray-200 border-2 border-dashed rounded-lg w-10 h-10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            <span className="font-semibold text-gray-800 max-w-xs truncate" title={session.title || "Untitled"}>
                              {session.title || "Untitled"}
                            </span>
                          </div>
                        </td>
                        <td>{getStatusBadge(session.status || "pending")}</td>
                        <td className="text-center">
                          {session.registrationFee > 0 ? (
                            <span className="flex items-center justify-center gap-1">
                              <DollarSign className="w-4 h-4 text-indigo-600" /> ${session.registrationFee}
                            </span>
                          ) : (
                            "Free"
                          )}
                        </td>
                        <td className="text-center">
                          {session.duration ? `${session.duration} hrs` : "N/A"}
                        </td>
                        <td className="text-center text-sm">
                          <div className="flex flex-col gap-1">
                            <p className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Reg: {formatDate(session.registrationStart)} → {formatDate(session.registrationEnd)}
                            </p>
                            <p className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> Class: {formatDate(session.classStart)} → {formatDate(session.classEnd)}
                            </p>
                          </div>
                        </td>
                        <td className="text-center">
                          {session.status === "rejected" ? (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleResubmit(session._id)}
                              className="btn btn-sm bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg flex items-center gap-1"
                            >
                              <Clock className="w-4 h-4" /> Resubmit
                            </motion.button>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-start p-1 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="w-16 h-1 bg-purple-300 rounded-full animate-pulse"></div>
              </div>
            </motion.div>

            {/* Mobile: Card View */}
            <div className="md:hidden grid grid-cols-1 gap-6">
              {sessions.map((session, idx) => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{
                    y: -10,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  }}
                  className="bg-gradient-to-br from-white to-indigo-50 rounded-xl overflow-hidden shadow-md border border-indigo-100"
                >
                  <div className="h-48 bg-gray-200 border-2 border-dashed border-gray-300 overflow-hidden">
                    {session.image ? (
                      <img
                        src={session.image}
                        alt={session.title || "Untitled"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1" title={session.title || "Untitled"}>
                      {session.title || "Untitled"}
                    </h3>
                    <div className="flex items-center gap-2">{getStatusBadge(session.status || "pending")}</div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{session.registrationFee > 0 ? `$${session.registrationFee}` : "Free"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{session.duration ? `${session.duration} hrs` : "N/A"}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> Reg: {formatDate(session.registrationStart)} → {formatDate(session.registrationEnd)}
                      </p>
                      <p className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" /> Class: {formatDate(session.classStart)} → {formatDate(session.classEnd)}
                      </p>
                    </div>
                    {session.status === "rejected" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleResubmit(session._id)}
                        className="btn btn-sm bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg w-full flex items-center justify-center gap-1"
                      >
                        <Clock className="w-4 h-4" /> Resubmit
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MySessions;