
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";
import { motion, AnimatePresence } from "framer-motion";
import { Book, User, FileText, Link, Download, Loader2, AlertCircle, Star, Image as ImageIcon } from "lucide-react";


const MyBookings = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = UseAuth();
  const queryClient = useQueryClient();
  const [expandedSession, setExpandedSession] = useState(null);
  const [materialsForSession, setMaterialsForSession] = useState({});
  const [materialsLoading, setMaterialsLoading] = useState({});
  const [showReviewForm, setShowReviewForm] = useState({});
  const [reviewData, setReviewData] = useState({});

  // Default placeholder image
  const placeholderImage = "https://via.placeholder.com/150?text=No+Image";

  // Fetch bookings for logged-in student
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["myBookings", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const res = await axiosSecure.get(`/bookings/student/${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  // Fetch review status for each session using existing /reviews/:sessionId
  const { data: reviewStatus = {}, isLoading: reviewStatusLoading } = useQuery({
    queryKey: ["reviewStatus", user?.email, bookings],
    queryFn: async () => {
      if (!user?.email || !bookings.length) return {};
      const status = {};
      for (const b of bookings) {
        const sessionId = b.sessionId || b.session?._id || `session-${bookings.indexOf(b)}`;
        const res = await axiosSecure.get(`/reviews/${sessionId}`);
        const reviews = res.data || [];
        const studentReview = reviews.find((r) => r.studentEmail === user?.email);
        status[sessionId] = { hasReview: !!studentReview, review: studentReview || null };
      }
      return status;
    },
    enabled: !!user?.email && bookings.length > 0,
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

  // Submit review
  const mutation = useMutation({
    mutationFn: async ({ sessionId, rating, comment }) => {
      const reviewData = {
        sessionId,
        studentEmail: user?.email || "",
        rating,
        comment,
      };
      const res = await axiosSecure.post("/reviews", reviewData);
      return res.data;
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Review submitted successfully",
        customClass: { confirmButton: "btn btn-success bg-gradient-to-r from-green-500 to-emerald-600 text-white" },
        timer: 2000,
      });
      setShowReviewForm({});
      setReviewData({});
      queryClient.invalidateQueries(["reviewStatus", user?.email, bookings]);
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.response?.data?.message || err.message,
        customClass: { confirmButton: "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white" },
      });
    },
  });

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

  // Handle review form toggle
  const toggleReviewForm = (sessionId) => {
    setShowReviewForm((prev) => ({ ...prev, [sessionId]: !prev[sessionId] }));
    if (!showReviewForm[sessionId]) {
      setReviewData((prev) => ({ ...prev, [sessionId]: { rating: 0, comment: "" } }));
    }
  };

  // Handle review input change
  const handleReviewInput = (sessionId, field, value) => {
    setReviewData((prev) => ({
      ...prev,
      [sessionId]: { ...prev[sessionId], [field]: value },
    }));
  };

  // Format date with fallback
  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Loading state
  if (bookingsLoading || reviewStatusLoading) {
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
      <div className="max-w-5xl mx-auto space-y-8">
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
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            📚 My Booked Sessions
          </h2>
          <p className="text-lg text-gray-600 mt-2">View your booked sessions, materials, and submit reviews</p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full"
          />
        </motion.header>

        {/* === BOOKINGS === */}
        {bookings.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">You haven’t booked any sessions yet.</p>
          </div>
        ) : (
          <div className="relative space-y-6">
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
            {bookings.map((b, idx) => {
              const session = b.session || {};
              const sessionId = b.sessionId || session._id || `session-${idx}`;
              return (
                <motion.div
                  key={b._id || `booking-${idx}`}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative pl-12"
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-2 md:left-4 top-4 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white"></div>
                  <div className="bg-white rounded-lg shadow-md p-4 border border-indigo-100">
                    {/* Session Image */}
                    <div className="mb-3">
                      {session.image ? (
                        <img
                          src={session.image}
                          alt={session.title || "Session"}
                          className="w-full h-32 rounded-md object-cover"
                          onError={(e) => (e.target.src = placeholderImage)}
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 rounded-md flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                          <span className="text-gray-500 ml-2">No Image</span>
                        </div>
                      )}
                    </div>
                    {/* Booking Header */}
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleAccordion(sessionId)}
                    >
                      <div className="font-semibold text-gray-800">{session.title || "Untitled Session"}</div>
                      <motion.div
                        animate={{ rotate: expandedSession === sessionId ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </div>
                    {/* Booking Details */}
                    <div className="text-sm text-gray-600 mt-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" /> Tutor: {session.tutorName || b.tutorEmail || "N/A"}
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Fee: {session.registrationFee == null ? "N/A" : session.registrationFee === 0 ? "Free" : `$${session.registrationFee}`}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <FileText className="w-4 h-4" /> Reg: {formatDate(session.registrationStart)} → {formatDate(session.registrationEnd)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <FileText className="w-4 h-4" /> Class: {formatDate(session.classStart)} → {formatDate(session.classEnd)}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link to={`/dashboard/student/bookings/${sessionId}`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" /> View Details
                        </motion.button>
                      </Link>
                      <Link to={`/dashboard/student/bookings/${sessionId}/materials`}>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" /> View Materials
                        </motion.button>
                      </Link>
                      {reviewStatus[sessionId]?.hasReview ? (
                        <motion.button
                          disabled
                          className="btn btn-sm bg-gray-300 text-gray-600 rounded-lg flex items-center gap-1 cursor-not-allowed"
                        >
                          <Star className="w-4 h-4" /> Review Submitted
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleReviewForm(sessionId)}
                          className="btn btn-sm bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-lg flex items-center gap-1"
                        >
                          <Star className="w-4 h-4" /> Add Review
                        </motion.button>
                      )}
                    </div>
                    {/* Materials and Review Accordion */}
                    <AnimatePresence>
                      {expandedSession === sessionId && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 space-y-4"
                        >
                          {/* Materials */}
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
                                key={m._id || `material-${idx}`}
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
                          {/* Review Form */}
                          {showReviewForm[sessionId] && !reviewStatus[sessionId]?.hasReview && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-gradient-to-br from-white to-indigo-50 rounded-lg p-4 border border-indigo-100 mt-4"
                            >
                              <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500" /> Submit Your Review
                              </h3>
                              <div className="space-y-4">
                                <div>
                                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                    <Star className="w-4 h-4 text-yellow-500" /> Rating
                                  </label>
                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <motion.button
                                        key={star}
                                        type="button"
                                        whileHover={{ scale: 1.2 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleReviewInput(sessionId, "rating", star)}
                                        className={`w-8 h-8 flex items-center justify-center ${
                                          reviewData[sessionId]?.rating >= star ? "text-yellow-500" : "text-gray-300"
                                        }`}
                                      >
                                        <Star className="w-6 h-6" fill={reviewData[sessionId]?.rating >= star ? "currentColor" : "none"} />
                                      </motion.button>
                                    ))}
                                  </div>
                                </div>
                                <div>
                                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                                    <FileText className="w-4 h-4 text-indigo-600" /> Comment
                                  </label>
                                  <textarea
                                    value={reviewData[sessionId]?.comment || ""}
                                    onChange={(e) => handleReviewInput(sessionId, "comment", e.target.value)}
                                    className="w-full textarea textarea-bordered bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                                    placeholder="Share your feedback..."
                                    rows="4"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      if (!reviewData[sessionId]?.rating) {
                                        Swal.fire({
                                          icon: "error",
                                          title: "Error!",
                                          text: "Please select a rating",
                                          customClass: { confirmButton: "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white" },
                                        });
                                        return;
                                      }
                                      mutation.mutate({
                                        sessionId,
                                        rating: reviewData[sessionId].rating,
                                        comment: reviewData[sessionId].comment,
                                      });
                                    }}
                                    disabled={mutation.isLoading}
                                    className={`btn btn-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg flex items-center gap-1 ${
                                      mutation.isLoading ? "opacity-70 cursor-not-allowed" : ""
                                    }`}
                                  >
                                    {mutation.isLoading ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                                      </>
                                    ) : (
                                      <>
                                        <Star className="w-4 h-4" /> Submit Review
                                      </>
                                    )}
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleReviewForm(sessionId)}
                                    className="btn btn-sm btn-outline flex items-center gap-1"
                                  >
                                    Cancel
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
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
      </div>
    </div>
  );
};

export default MyBookings;
