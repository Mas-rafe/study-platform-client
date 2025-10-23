import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import { Link } from "react-router";

const ManageBookings = () => {
  const axiosSecure = useAxiosSecure();

  // Fetch pending bookings
  const {
    data: pendingBookings = [],
    refetch: refetchPending,
    isLoading: loadingPending,
  } = useQuery({
    queryKey: ["pendingBookings"],
    queryFn: async () => {
      const res = await axiosSecure.get("/bookings?status=pending");
      return res.data;
    },
  });

  // Fetch all bookings
  const {
    data: allBookings = [],
    refetch: refetchAll,
    isLoading: loadingAll,
  } = useQuery({
    queryKey: ["allBookings"],
    queryFn: async () => {
      const res = await axiosSecure.get("/bookings");
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

  // Approve booking
  const handleApprove = async (booking) => {
    try {
      const res = await axiosSecure.patch(`/bookings/${booking._id}`, {
        status: "approved",
      });
      if (res.data.success) {
 
        Swal.fire("Approved!", "Booking has been approved.", "success");
        refetchPending();
        refetchAll();
      }
    } catch (err) {
      Swal.fire("Error!", err.response?.data?.message || "Failed to approve", "error");
    }
  };

  // Reject booking
  const handleReject = async (id) => {
    const result = await Swal.fire({
      title: "Reject Booking?",
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
        const res = await axiosSecure.patch(`/bookings/${id}`, {
          status: "rejected",
        });
        if (res.data.success) {
          Swal.fire("Rejected!", "Booking has been rejected.", "error");
          refetchPending();
          refetchAll();
        }
      } catch (err) {
        Swal.fire("Error!", "Failed to reject booking.", "error");
      }
    }
  };

  // Update booking
  const handleUpdate = async (booking) => {
    const { value: updates } = await Swal.fire({
      title: "Update Booking",
      html: `
        <input id="studentEmail" class="swal2-input mb-2" placeholder="Student Email" value="${booking.studentEmail}" />
        <input id="tutorEmail" class="swal2-input mb-2" placeholder="Tutor Email" value="${booking.tutorEmail}" />
        <input id="sessionId" class="swal2-input" placeholder="Session ID" value="${booking.sessionId}" />
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          studentEmail: document.getElementById("studentEmail").value,
          tutorEmail: document.getElementById("tutorEmail").value,
          sessionId: document.getElementById("sessionId").value,
        };
      },
      confirmButtonText: "Save Changes",
      customClass: {
        confirmButton: "btn btn-primary",
      },
    });

    if (!updates) return;

    try {
      const res = await axiosSecure.patch(`/bookings/${booking._id}`, updates);
      if (res.data.success) {
        Swal.fire("Updated!", "Booking has been updated.", "success");
        refetchAll();
      }
    } catch (err) {
      Swal.fire("Error!", "Failed to update.", "error");
    }
  };

  // Delete booking
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Booking?",
      text: "This will permanently remove the booking.",
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
        const res = await axiosSecure.delete(`/bookings/${id}`);
        if (res.data.deletedCount > 0) {
          Swal.fire("Deleted!", "Booking removed permanently.", "success");
          refetchAll();
          refetchPending();
        }
      } catch (err) {
        Swal.fire("Error!", "Failed to delete.", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* === PENDING BOOKINGS (CARDS) === */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Pending Bookings
              </h2>
              <p className="text-gray-600 mt-1">Review and manage student enrollment requests</p>
            </div>
            <div className="flex items-center gap-2 mt-3 md:mt-0">
              <span className="badge badge-warning badge-lg font-medium">{pendingBookings.length} Pending</span>
            </div>
          </div>

          {pendingBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No pending bookings to review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingBookings.map((booking, idx) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ 
                    y: -10,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                  className="bg-gradient-to-br from-white to-indigo-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-indigo-100"
                >
                  {/* Session Image */}
                  <div className="h-48 bg-gray-200 border-2 border-dashed border-gray-300 overflow-hidden">
                    {booking.session?.image ? (
                      <img
                        src={booking.session.image}
                        alt={booking.session.title}
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
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-1">
                      {booking.session?.title || "Untitled Session"}
                    </h3>
                    <p className="text-sm text-indigo-600 font-medium">
                      {booking.session?.subject || "N/A"}
                    </p>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>{booking.studentEmail}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Booked: {new Date(booking.bookedAt).toLocaleDateString()}</span>
                    </div>

                    {/* Fee */}
                    {booking.session?.registrationFee > 0 ? (
                      <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.283v4.97c-.221-.087-.412-.18-.567-.283C6.17 10.824 5 9.177 5 7.5 5 5.823 6.17 4.176 8.433 3.418zm3.134-.001C13.83 8.176 15 9.823 15 11.5c0 1.677-1.17 3.324-3.134 4.082-.221.087-.412.18-.567.283v-4.97c.221.087.412.18.567.283z"/>
                        </svg>
                        <span>${booking.session.registrationFee}</span>
                      </div>
                    ) : (
                      <span className="badge badge-success badge-sm">Free</span>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <Link
                        to={`/session/${booking.sessionId}`}
                        className="flex-1 btn btn-outline btn-primary btn-sm rounded-lg"
                      >
                        View
                      </Link>
                      <button
                        onClick={() => handleApprove(booking)}
                        className="flex-1 btn btn-success btn-sm rounded-lg text-white"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(booking._id)}
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

        {/* === ALL BOOKINGS (TABLE WITH SCROLL) === */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                All Bookings
              </h2>
              <p className="text-gray-600 mt-1">Full history of student enrollments</p>
            </div>
            <div className="flex gap-2 mt-3 md:mt-0">
              <span className="badge badge-success badge-lg">{allBookings.filter(b => b.status === 'approved').length} Approved</span>
              <span className="badge badge-error badge-lg">{allBookings.filter(b => b.status === 'rejected').length} Rejected</span>
            </div>
          </div>

          {allBookings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No bookings available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-indigo-200 shadow-inner">
              {/* Top Scroll Indicator */}
              <div className="flex justify-end p-1 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="w-16 h-1 bg-indigo-300 rounded-full animate-pulse"></div>
              </div>

              <table className="table w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <th className="text-left">#</th>
                    <th className="text-left">Session</th>
                    <th className="text-left">Student</th>
                    <th className="text-left">Tutor</th>
                    <th className="text-center">Fee</th>
                    <th className="text-center">Status</th>
                    <th className="text-center">Booked At</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allBookings.map((booking, idx) => (
                    <motion.tr
                      key={booking._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-indigo-50 transition-colors border-b"
                    >
                      <td className="font-medium">{idx + 1}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          {booking.session?.image ? (
                            <img src={booking.session.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="bg-gray-200 border-2 border-dashed rounded-lg w-10 h-10" />
                          )}
                          <div>
                            <p className="font-semibold text-gray-800">{booking.session?.title || "N/A"}</p>
                            <p className="text-xs text-gray-500">ID: {booking.sessionId}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <p className="font-medium text-gray-700">{booking.studentEmail}</p>
                      </td>
                      <td>
                        <p className="font-medium text-gray-700">{booking.tutorEmail}</p>
                      </td>
                      <td className="text-center">
                        {booking.session?.registrationFee > 0 ? (
                          <span className="font-semibold text-green-600">${booking.session.registrationFee}</span>
                        ) : (
                          <span className="badge badge-success badge-sm">Free</span>
                        )}
                      </td>
                      <td className="text-center">
                        <span
                          className={`badge badge-lg font-medium ${
                            booking.status === "approved"
                              ? "badge-success"
                              : booking.status === "rejected"
                              ? "badge-error"
                              : "badge-warning"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="text-center text-sm">
                        {new Date(booking.bookedAt).toLocaleString()}
                      </td>
                      <td className="text-center">
                        <div className="flex gap-1 justify-center">
                          <Link
                            to={`/session/${booking.sessionId}`}
                            className="btn btn-ghost btn-xs text-primary"
                          >
                            View
                          </Link>
                          {booking.status === "approved" && (
                            <>
                              <button
                                onClick={() => handleUpdate(booking)}
                                className="btn btn-primary btn-xs"
                              >
                                Update
                              </button>
                              <button
                                onClick={() => handleDelete(booking._id)}
                                className="btn btn-error btn-xs"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {booking.status === "rejected" && (
                            <span className="text-xs text-gray-400 italic">No actions</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* Bottom Scroll Indicator */}
              <div className="flex justify-start p-1 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="w-16 h-1 bg-purple-300 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default ManageBookings;