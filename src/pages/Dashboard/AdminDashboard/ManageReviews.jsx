import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import { motion } from "framer-motion";
import { Link } from "react-router";

const ManageReviews = () => {
  const axiosSecure = useAxiosSecure();

  // Step 1: Fetch all reviews
  const {
    data: reviews = [],
    refetch: refetchReviews,
    isLoading: loadingReviews,
    isError: errorReviews,
    error: reviewError,
  } = useQuery({
    queryKey: ["all-reviews"],
    queryFn: async () => {
      const res = await axiosSecure.get("/reviews");
      return res.data;
    },
    retry: false,
  });

  // Step 2: Extract unique student emails
  const studentEmails = [...new Set(reviews.map((r) => r.studentEmail))];

  // Step 3: Fetch users only for those emails
  const {
    data: usersMap = {},
    isLoading: loadingUsers,
  } = useQuery({
    queryKey: ["users-for-reviews", studentEmails],
    queryFn: async () => {
      if (studentEmails.length === 0) return {};
      const res = await axiosSecure.post("/users/by-emails", { emails: studentEmails });
      // Response: { "email": { _id, name, photo } }
      return res.data.reduce((acc, user) => {
        acc[user.email] = user;
        return acc;
      }, {});
    },
    enabled: studentEmails.length > 0, // Only run if emails exist
  });

  if (loadingReviews || loadingUsers) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (errorReviews) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 text-lg font-medium">
          {reviewError?.response?.data?.message || "Failed to load reviews."}
        </p>
      </div>
    );
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Delete Review?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      customClass: { confirmButton: "btn btn-error", cancelButton: "btn btn-ghost" },
    });

    if (result.isConfirmed) {
      try {
        const res = await axiosSecure.delete(`/reviews/${id}`);
        if (res.data?.deletedCount > 0) {
          Swal.fire("Deleted!", "Review removed.", "success");
          refetchReviews();
        }
      } catch (err) {
        Swal.fire("Error!", err.response?.data?.message || "Failed", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">

        {/* === HEADING === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Manage Reviews
              </h2>
              <p className="text-gray-600 mt-1">Monitor and moderate student feedback</p>
            </div>
            <span className="badge badge-primary badge-lg font-medium">{reviews.length} Total</span>
          </div>
        </motion.div>

        {/* === TABLE === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {reviews.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No reviews available.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="flex justify-end p-1 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="w-16 h-1 bg-indigo-300 rounded-full animate-pulse"></div>
              </div>

              <table className="table w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <th className="text-left">#</th>
                    <th className="text-left">Student</th>
                    <th className="text-left">Session</th>
                    <th className="text-center">Rating</th>
                    <th className="text-left">Comment</th>
                    <th className="text-center">Date</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review, idx) => {
                    const user = usersMap[review.studentEmail] || {};

                    return (
                      <motion.tr
                        key={review._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-indigo-50 transition-all duration-200 border-b"
                      >
                        <td className="font-medium text-gray-700">{idx + 1}</td>

                        {/* === STUDENT + PHOTO FROM USERS === */}
                        <td>
                          <div className="flex items-center gap-3">
                            {user.photo ? (
                              <div className="avatar">
                                <div className="mask mask-circle w-10 h-10 ring ring-primary ring-offset-base-100 ring-offset-2">
                                  <img
                                    src={user.photo}
                                    alt={review.studentName}
                                    className="object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.studentName)}&background=6366f1&color=fff`;
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="avatar placeholder">
                                <div className="mask mask-circle w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center">
                                  <span className="text-sm">
                                    {review.studentName?.charAt(0).toUpperCase() || "S"}
                                  </span>
                                </div>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-800">{review.studentName}</p>
                              <p className="text-xs text-gray-500">{review.studentEmail}</p>
                            </div>
                          </div>
                        </td>

                        <td>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{review.sessionId}</code>
                        </td>

                        <td className="text-center">
                          <div className="flex justify-center items-center gap-1">
                            <span className="font-bold text-yellow-500">{review.rating}</span>
                            <svg className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                            </svg>
                          </div>
                        </td>

                        <td>
                          <p className="max-w-xs truncate text-sm text-gray-700" title={review.comment}>
                            {review.comment}
                          </p>
                        </td>

                        <td className="text-center text-sm">
                          {new Date(review.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>

                        <td className="text-center">
                          <div className="flex gap-2 justify-center">
                            <Link
                              to={`/admin/review/${review._id}`}
                              className="btn btn-ghost btn-xs text-primary hover:bg-primary hover:text-white rounded-lg"
                              title="View Details"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>

                            <button
                              onClick={() => handleDelete(review._id)}
                              className="btn btn-error btn-xs rounded-lg shadow-sm hover:shadow-md"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="flex justify-start p-1 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="w-16 h-1 bg-purple-300 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ManageReviews;