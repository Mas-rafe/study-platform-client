import { useState } from "react";
import { Link as RouterLink } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  User,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  Star,
  Image as ImageIcon,
  Calendar,
  ChevronDown,
  Eye,
  FolderOpen,
  DollarSign,
  MessageSquare,
} from "lucide-react";

const placeholderImage = "https://via.placeholder.com/600x300?text=No+Image";

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

const getSessionId = (booking, idx) => {
  return booking.sessionId || booking.session?._id || `session-${idx}`;
};

const InfoItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-base-200 border border-base-300 p-3">
      <div className="w-9 h-9 rounded-lg bg-base-100 flex items-center justify-center border border-base-300">
        <Icon className="w-4 h-4 text-indigo-600" />
      </div>

      <div>
        <p className="text-xs text-base-content/50">{label}</p>
        <p className="text-sm font-semibold text-base-content">{value}</p>
      </div>
    </div>
  );
};

const MyBookings = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = UseAuth();
  const queryClient = useQueryClient();

  const [expandedSession, setExpandedSession] = useState(null);
  const [materialsForSession, setMaterialsForSession] = useState({});
  const [materialsLoading, setMaterialsLoading] = useState({});
  const [showReviewForm, setShowReviewForm] = useState({});
  const [reviewData, setReviewData] = useState({});

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

  // Fetch review status for each session
  const { data: reviewStatus = {}, isLoading: reviewStatusLoading } = useQuery({
    queryKey: ["reviewStatus", user?.email, bookings],
    queryFn: async () => {
      if (!user?.email || !bookings.length) return {};

      const status = {};

      for (const [idx, booking] of bookings.entries()) {
        const sessionId = getSessionId(booking, idx);

        try {
          const res = await axiosSecure.get(`/reviews/${sessionId}`);
          const reviews = res.data || [];
          const studentReview = reviews.find(
            (review) => review.studentEmail === user?.email
          );

          status[sessionId] = {
            hasReview: !!studentReview,
            review: studentReview || null,
          };
        } catch {
          status[sessionId] = {
            hasReview: false,
            review: null,
          };
        }
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
      setMaterialsForSession((prev) => ({
        ...prev,
        [sessionId]: res.data || [],
      }));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.response?.data?.message || err.message,
        customClass: {
          confirmButton:
            "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white",
        },
      });

      setMaterialsForSession((prev) => ({ ...prev, [sessionId]: [] }));
    } finally {
      setMaterialsLoading((prev) => ({ ...prev, [sessionId]: false }));
    }
  };

  // Submit review
  const mutation = useMutation({
    mutationFn: async ({ sessionId, rating, comment }) => {
      const reviewPayload = {
        sessionId,
        studentEmail: user?.email || "",
        rating,
        comment,
      };

      const res = await axiosSecure.post("/reviews", reviewPayload);
      return res.data;
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Review submitted successfully",
        customClass: {
          confirmButton:
            "btn btn-success bg-gradient-to-r from-green-500 to-emerald-600 text-white",
        },
        timer: 2000,
      });

      setShowReviewForm({});
      setReviewData({});

      queryClient.invalidateQueries({
        queryKey: ["reviewStatus", user?.email],
      });
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.response?.data?.message || err.message,
        customClass: {
          confirmButton:
            "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white",
        },
      });
    },
  });

  const toggleAccordion = (sessionId) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      return;
    }

    setExpandedSession(sessionId);

    if (!materialsForSession[sessionId]) {
      fetchMaterials(sessionId);
    }
  };

  const toggleReviewForm = (sessionId) => {
    setExpandedSession(sessionId);

    if (!materialsForSession[sessionId]) {
      fetchMaterials(sessionId);
    }

    setShowReviewForm((prev) => ({
      ...prev,
      [sessionId]: !prev[sessionId],
    }));

    setReviewData((prev) => ({
      ...prev,
      [sessionId]: prev[sessionId] || { rating: 0, comment: "" },
    }));
  };

  const handleReviewInput = (sessionId, field, value) => {
    setReviewData((prev) => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        [field]: value,
      },
    }));
  };

  const isSubmittingReview = mutation.isPending || mutation.isLoading;

  if (bookingsLoading || reviewStatusLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200 text-base-content">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-16 h-16 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content py-8 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="text-center relative"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-20 rounded-2xl"></div>
          </div>

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg mb-4">
            <BookOpen className="w-7 h-7" />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            My Booked Sessions
          </h2>

          <p className="text-base-content/70 mt-2 text-lg">
            View your booked sessions, access materials, and submit reviews.
          </p>

          <div className="mt-4">
            <span className="badge badge-primary badge-outline badge-lg">
              {bookings.length} booked session{bookings.length !== 1 ? "s" : ""}
            </span>
          </div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-5 rounded-full"
          />
        </motion.header>

        {/* Empty State */}
        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-base-100 border border-base-300 rounded-2xl shadow-lg p-10 text-center"
          >
            <AlertCircle className="w-14 h-14 text-base-content/40 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-base-content">
              No booked sessions yet
            </h3>
            <p className="text-base-content/60 mt-2">
              After you book a study session, it will appear here.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {bookings.map((booking, idx) => {
              const session = booking.session || {};
              const sessionId = getSessionId(booking, idx);
              const hasReview = reviewStatus[sessionId]?.hasReview;

              return (
                <motion.article
                  key={booking._id || `booking-${idx}`}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="card lg:card-side bg-base-100 text-base-content border border-base-300 shadow-xl overflow-hidden"
                >
                  {/* Image */}
                  <figure className="lg:w-80 h-56 lg:h-auto bg-base-200">
                    {session.image ? (
                      <img
                        src={session.image}
                        alt={session.title || "Session"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = placeholderImage;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-base-content/50">
                        <ImageIcon className="w-12 h-12 mb-2" />
                        <span className="text-sm">No Image</span>
                      </div>
                    )}
                  </figure>

                  {/* Content */}
                  <div className="card-body p-5 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                      <div>
                        <h3 className="card-title text-xl md:text-2xl text-base-content">
                          {session.title || "Untitled Session"}
                        </h3>

                        <p className="text-sm text-base-content/60 mt-1 line-clamp-2">
                          {session.description ||
                            "No description available for this session."}
                        </p>
                      </div>

                      <span className="badge badge-success badge-outline font-medium w-fit">
                        Booked
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
                      <InfoItem
                        icon={User}
                        label="Tutor"
                        value={session.tutorName || booking.tutorEmail || "N/A"}
                      />

                      <InfoItem
                        icon={DollarSign}
                        label="Fee"
                        value={
                          session.registrationFee == null
                            ? "N/A"
                            : session.registrationFee === 0
                            ? "Free"
                            : `$${session.registrationFee}`
                        }
                      />

                      <InfoItem
                        icon={Calendar}
                        label="Registration"
                        value={`${formatDate(
                          session.registrationStart
                        )} → ${formatDate(session.registrationEnd)}`}
                      />

                      <InfoItem
                        icon={Calendar}
                        label="Class"
                        value={`${formatDate(session.classStart)} → ${formatDate(
                          session.classEnd
                        )}`}
                      />
                    </div>

                    {/* Buttons */}
                    <div className="card-actions justify-start mt-5 gap-2">
                      <RouterLink
                        to={`/dashboard/student/bookings/${sessionId}`}
                        className="btn btn-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </RouterLink>

                      <RouterLink
                        to={`/dashboard/student/bookings/${sessionId}/materials`}
                        className="btn btn-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Materials
                      </RouterLink>

                      {hasReview ? (
                        <button
                          disabled
                          className="btn btn-sm bg-base-300 text-base-content/60 border-0 cursor-not-allowed"
                        >
                          <Star className="w-4 h-4" />
                          Review Submitted
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleReviewForm(sessionId)}
                          className="btn btn-sm bg-gradient-to-r from-yellow-500 to-orange-600 text-white border-0"
                        >
                          <Star className="w-4 h-4" />
                          Add Review
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleAccordion(sessionId)}
                        className="btn btn-sm btn-outline"
                      >
                        Quick Preview
                        <motion.span
                          animate={{
                            rotate: expandedSession === sessionId ? 180 : 0,
                          }}
                          transition={{ duration: 0.25 }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.span>
                      </button>
                    </div>

                    {/* Expanded Area */}
                    <AnimatePresence>
                      {expandedSession === sessionId && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-5 border-t border-base-300 pt-5 space-y-5 overflow-hidden"
                        >
                          {/* Materials Preview */}
                          <section className="bg-base-200 rounded-2xl border border-base-300 p-4">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="font-bold text-base-content flex items-center gap-2">
                                <FolderOpen className="w-5 h-5 text-indigo-600" />
                                Materials Preview
                              </h4>
                            </div>

                            {materialsLoading[sessionId] ? (
                              <div className="flex justify-center py-6">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                              </div>
                            ) : materialsForSession[sessionId]?.length === 0 ? (
                              <div className="text-center py-6">
                                <AlertCircle className="w-8 h-8 text-base-content/40 mx-auto mb-2" />
                                <p className="text-base-content/60">
                                  No materials available for this session.
                                </p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {materialsForSession[sessionId]?.map(
                                  (material, materialIdx) => {
                                    const materialImage =
                                      material.imageUrl || material.image;
                                    const materialLink =
                                      material.fileUrl ||
                                      material.imageUrl ||
                                      material.image;

                                    return (
                                      <motion.div
                                        key={
                                          material._id ||
                                          `material-${sessionId}-${materialIdx}`
                                        }
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-base-100 rounded-xl p-4 border border-base-300"
                                      >
                                        <h5 className="font-semibold text-base-content">
                                          {material.title || "Untitled"}
                                        </h5>

                                        <p className="text-sm text-base-content/60 mt-1 mb-3">
                                          {material.description ||
                                            "No description"}
                                        </p>

                                        {materialImage && (
                                          <img
                                            src={materialImage}
                                            alt={material.title || "Material"}
                                            className="w-full h-32 rounded-lg object-cover mb-3"
                                          />
                                        )}

                                        {materialLink && (
                                          <div className="flex flex-wrap gap-2">
                                            <a
                                              href={materialLink}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="btn btn-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0"
                                            >
                                              <FileText className="w-3 h-3" />
                                              Open Material
                                            </a>

                                            <a
                                              href={materialLink}
                                              download
                                              className="btn btn-xs btn-outline"
                                            >
                                              <Download className="w-3 h-3" />
                                              Download
                                            </a>
                                          </div>
                                        )}
                                      </motion.div>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          </section>

                          {/* Review Form */}
                          {showReviewForm[sessionId] && !hasReview && (
                            <motion.section
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="bg-base-100 rounded-2xl p-5 border border-base-300 shadow-sm"
                            >
                              <h4 className="font-bold text-base-content mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                                Submit Your Review
                              </h4>

                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium text-base-content/80 mb-2 flex items-center gap-2">
                                    <Star className="w-4 h-4 text-yellow-500" />
                                    Rating
                                  </label>

                                  <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <motion.button
                                        key={star}
                                        type="button"
                                        whileHover={{ scale: 1.18 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() =>
                                          handleReviewInput(
                                            sessionId,
                                            "rating",
                                            star
                                          )
                                        }
                                        className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                                          reviewData[sessionId]?.rating >= star
                                            ? "text-yellow-500 bg-yellow-500/10"
                                            : "text-base-content/30 hover:bg-base-200"
                                        }`}
                                      >
                                        <Star
                                          className="w-6 h-6"
                                          fill={
                                            reviewData[sessionId]?.rating >= star
                                              ? "currentColor"
                                              : "none"
                                          }
                                        />
                                      </motion.button>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <label className="text-sm font-medium text-base-content/80 mb-2 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                                    Comment
                                  </label>

                                  <textarea
                                    value={reviewData[sessionId]?.comment || ""}
                                    onChange={(e) =>
                                      handleReviewInput(
                                        sessionId,
                                        "comment",
                                        e.target.value
                                      )
                                    }
                                    className="w-full textarea textarea-bordered bg-base-100 text-base-content focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                                    placeholder="Share your feedback..."
                                    rows="4"
                                  />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!reviewData[sessionId]?.rating) {
                                        Swal.fire({
                                          icon: "error",
                                          title: "Error!",
                                          text: "Please select a rating",
                                          customClass: {
                                            confirmButton:
                                              "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white",
                                          },
                                        });
                                        return;
                                      }

                                      mutation.mutate({
                                        sessionId,
                                        rating: reviewData[sessionId].rating,
                                        comment:
                                          reviewData[sessionId].comment || "",
                                      });
                                    }}
                                    disabled={isSubmittingReview}
                                    className={`btn btn-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 ${
                                      isSubmittingReview
                                        ? "opacity-70 cursor-not-allowed"
                                        : ""
                                    }`}
                                  >
                                    {isSubmittingReview ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Submitting...
                                      </>
                                    ) : (
                                      <>
                                        <Star className="w-4 h-4" />
                                        Submit Review
                                      </>
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => toggleReviewForm(sessionId)}
                                    className="btn btn-sm btn-outline"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </motion.section>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;