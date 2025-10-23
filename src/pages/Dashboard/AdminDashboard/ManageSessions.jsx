import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { Link } from "react-router";

const ManageSessions = () => {
  const axiosSecure = useAxiosSecure();

  // Fetch pending sessions
  const {
    data: pendingSessions = [],
    refetch: refetchPending,
    isLoading: loadingPending,
  } = useQuery({
    queryKey: ["pendingSessions"],
    queryFn: async () => {
      const res = await axiosSecure.get("/sessions/pending");
      return res.data;
    },
  });

  // Fetch all sessions
  const {
    data: allSessions = [],
    refetch: refetchAll,
    isLoading: loadingAll,
  } = useQuery({
    queryKey: ["allSessions"],
    queryFn: async () => {
      const res = await axiosSecure.get("/sessions");
      return res.data;
    },
  });

  if (loadingPending || loadingAll) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Approve session
  const handleApprove = async (session) => {
    const { value: formValues } = await Swal.fire({
      title: "Approve Session",
      html: `
        <label class="block text-sm font-medium mb-1">Session Type:</label>
        <select id="sessionType" class="swal2-input mb-3">
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
        <label class="block text-sm font-medium mb-1">Registration Fee:</label>
        <input type="number" id="fee" class="swal2-input" placeholder="Enter fee" value="${session.registrationFee || 0}" />
      `,
      focusConfirm: false,
      preConfirm: () => {
        const type = document.getElementById("sessionType").value;
        const fee = Number(document.getElementById("fee").value) || 0;
        return { type, fee };
      },
      confirmButtonText: "Approve",
      customClass: {
        popup: "rounded-xl",
        confirmButton: "btn btn-success",
      },
    });

    if (!formValues) return;

    try {
      const res = await axiosSecure.patch(`/sessions/${session._id}/approve`, {
        fee: formValues.type === "free" ? 0 : formValues.fee,
      });
      if (res.data.success) {
        Swal.fire("Approved!", "Session is now live.", "success");
        refetchPending();
        refetchAll();
      }
    } catch (err) {
      Swal.fire("Error!", err.response?.data?.message || "Failed to approve", "error");
    }
  };

  // Reject session
  const handleReject = async (id) => {
    const result = await Swal.fire({
      title: "Reject Session?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Reject",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "btn btn-error",
        cancelButton: "btn btn-ghost",
      },
    });

    if (result.isConfirmed) {
      try {
        const res = await axiosSecure.patch(`/sessions/${id}/reject`);
        if (res.data.success) {
          Swal.fire("Rejected!", "Session has been rejected.", "error");
          refetchPending();
          refetchAll();
        }
      } catch (err) {
        Swal.fire("Error!", "Failed to reject session.", "error");
      }
    }
  };

  // Update session
  const handleUpdate = async (session) => {
    const { value: updates } = await Swal.fire({
      title: "Update Session",
      html: `
        <input id="title" class="swal2-input mb-2" placeholder="Title" value="${session.title}" />
        <input id="subject" class="swal2-input mb-2" placeholder="Subject" value="${session.subject}" />
        <input id="duration" type="number" class="swal2-input mb-2" placeholder="Duration (hrs)" value="${session.duration}" />
        <input id="fee" type="number" class="swal2-input" placeholder="Fee" value="${session.registrationFee}" />
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          title: document.getElementById("title").value,
          subject: document.getElementById("subject").value,
          duration: Number(document.getElementById("duration").value) || 0,
          registrationFee: Number(document.getElementById("fee").value) || 0,
        };
      },
      confirmButtonText: "Save Changes",
      customClass: {
        confirmButton: "btn btn-primary",
      },
    });

    if (!updates) return;

    try {
      const res = await axiosSecure.patch(`/sessions/${session._id}`, updates);
      if (res.data.success) {
        Swal.fire("Updated!", "Session details updated.", "success");
        refetchAll();
      }
    } catch (err) {
      Swal.fire("Error!", "Failed to update.", "error");
    }
  };

  // Delete session
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Session?",
      text: "This will permanently remove the session.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "btn btn-error",
        cancelButton: "btn btn-ghost",
      },
    });

    if (result.isConfirmed) {
      try {
        const res = await axiosSecure.delete(`/sessions/${id}`);
        if (res.data.deletedCount > 0) {
          Swal.fire("Deleted!", "Session removed permanently.", "success");
          refetchAll();
          refetchPending();
        }
      } catch (err) {
        Swal.fire("Error!", "Failed to delete.", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 mt-6 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* === PENDING SESSIONS === */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Pending Sessions
              </h2>
              <p className="text-gray-600 mt-1">Review and approve tutor-submitted study sessions</p>
            </div>
            <div className="flex items-center gap-2 mt-3 md:mt-0">
              <span className="badge badge-warning badge-lg font-medium">{pendingSessions.length} Pending</span>
            </div>
          </div>

          {pendingSessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No pending sessions to review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingSessions.map((session, idx) => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{
                    y: -10,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  className="bg-gradient-to-br from-white to-indigo-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-indigo-100"
                >
                  {/* Image */}
                  <div className="h-48 bg-gray-200 border-2 border-dashed border-gray-300 overflow-hidden">
                    {session.image ? (
                      <img
                        src={session.image}
                        alt={session.title}
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

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{session.title}</h3>
                    <p className="text-sm text-indigo-600 font-medium">{session.subject}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{session.tutorName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{session.duration} hrs</span>
                      <span className="text-gray-500">
                        Ends: {new Date(session.registrationEnd).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <Link
                        to={`/session/${session._id}`}
                        className="flex-1 btn btn-outline btn-primary btn-sm rounded-lg"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleApprove(session)}
                        className="flex-1 btn btn-success btn-sm rounded-lg text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(session._id)}
                        className="flex-1 btn btn-error btn-sm rounded-lg text-white"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* === ALL SESSIONS === */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                All Sessions
              </h2>
              <p className="text-gray-600 mt-1">Manage approved, rejected, and live sessions</p>
            </div>
            <div className="flex gap-2 mt-3 md:mt-0">
              <span className="badge badge-success badge-lg">{allSessions.filter(s => s.status === 'approved').length} Approved</span>
              <span className="badge badge-error badge-lg">{allSessions.filter(s => s.status === 'rejected').length} Rejected</span>
            </div>
          </div>

          {allSessions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No sessions available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <th className="text-left">#</th>
                    <th className="text-left">Title</th>
                    <th className="text-left">Tutor</th>
                    <th className="text-left">Subject</th>
                    <th className="text-center">Duration</th>
                    <th className="text-center">Reg. Ends</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allSessions.map((session, idx) => (
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
                            <div className="bg-gray-200 border-2 border-dashed rounded-lg w-10 h-10" />
                          )}
                          <span className="font-semibold text-gray-800">{session.title}</span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-gray-700">{session.tutorName}</p>
                          <p className="text-xs text-gray-500">{session.tutorEmail}</p>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-outline badge-primary">{session.subject}</span>
                      </td>
                      <td className="text-center font-medium">{session.duration} hrs</td>
                      <td className="text-center text-sm">
                        {session.registrationEnd ? new Date(session.registrationEnd).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge badge-lg font-medium ${session.status === "approved"
                              ? "badge-success"
                              : session.status === "rejected"
                                ? "badge-error"
                                : "badge-warning"
                            }`}
                        >
                          {session.status}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex gap-1 justify-center">
                          <Link
                            to={`/session/${session._id}`}
                            className="btn btn-ghost btn-xs text-primary"
                          >
                            View
                          </Link>
                          {session.status === "approved" && (
                            <>
                              <button
                                onClick={() => handleUpdate(session)}
                                className="btn btn-primary btn-xs"
                              >
                                Update
                              </button>
                              <button
                                onClick={() => handleDelete(session._id)}
                                className="btn btn-error btn-xs"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {session.status === "rejected" && (
                            <span className="text-xs text-gray-400 italic">No actions</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default ManageSessions;