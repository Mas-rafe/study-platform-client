import { useState } from "react";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  Star,
  Calendar,
  Clock,
  DollarSign,
  User,
  BookOpen,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  NotebookPen,
  MessageSquare,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  Image as ImageIcon,
} from "lucide-react";

import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";

const placeholderImage =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

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

const formatFee = (session) => {
  const fee = session?.registrationFee ?? session?.fee;

  if (fee === undefined || fee === null || fee === "") return "N/A";
  if (Number(fee) === 0) return "Free";

  return `$${fee}`;
};

const getClassStart = (session) => {
  return session?.classStart || session?.classStartDate || session?.startDate;
};

const getClassEnd = (session) => {
  return session?.classEnd || session?.classEndDate || session?.endDate;
};

const getAverageRating = (reviews = []) => {
  if (!reviews.length) return 0;

  const total = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
  return total / reviews.length;
};

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-base-200 text-base-content flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-16 h-16 text-primary" />
      </motion.div>
    </div>
  );
};

const StarRating = ({ rating = 0, size = 18 }) => {
  const roundedRating = Math.round(Number(rating) || 0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={size}
          className={
            index < roundedRating
              ? "fill-yellow-400 text-yellow-400"
              : "text-base-content/30"
          }
        />
      ))}
    </div>
  );
};

const RatingInput = ({ value, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => onChange(rating)}
          className="transition-transform hover:scale-110"
        >
          <Star
            size={26}
            className={
              rating <= value
                ? "fill-yellow-400 text-yellow-400"
                : "text-base-content/30"
            }
          />
        </button>
      ))}
    </div>
  );
};

const InfoCard = ({ icon: Icon, label, value, colorClass }) => {
  return (
    <div className="bg-base-200 border border-base-300 rounded-3xl p-5 h-full">
      <div
        className={`w-12 h-12 rounded-2xl ${colorClass} text-white flex items-center justify-center mb-4`}
      >
        <Icon className="w-6 h-6" />
      </div>

      <p className="text-sm text-base-content/50">{label}</p>
      <p className="text-lg font-bold text-base-content mt-1">{value}</p>
    </div>
  );
};

const TimelineItem = ({ icon: Icon, title, value, colorClass }) => {
  return (
    <div className="relative pl-10">
      <div
        className={`absolute left-0 top-1 w-7 h-7 rounded-full ${colorClass} text-white flex items-center justify-center ring-4 ring-base-100`}
      >
        <Icon className="w-4 h-4" />
      </div>

      <h4 className="font-bold text-base-content">{title}</h4>
      <p className="text-sm text-base-content/60 mt-1">{value}</p>
    </div>
  );
};

const ReviewCard = ({ review, index }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-base-200 border border-base-300 rounded-3xl p-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold">
            {(review.studentName || "A").charAt(0).toUpperCase()}
          </div>

          <div>
            <h4 className="font-bold text-base-content">
              {review.studentName || "Anonymous"}
            </h4>

            <p className="text-sm text-base-content/50">
              Student feedback
            </p>
          </div>
        </div>

        <StarRating rating={review.rating} />
      </div>

      <p className="text-base-content/70 leading-relaxed mt-4">
        {review.comment || "No comment provided."}
      </p>
    </motion.article>
  );
};

const EmptyState = ({ title, text }) => {
  return (
    <div className="text-center py-12 bg-base-200 border border-base-300 rounded-3xl">
      <AlertCircle className="w-12 h-12 text-base-content/40 mx-auto mb-3" />
      <h4 className="font-bold text-lg text-base-content">{title}</h4>
      <p className="text-base-content/60 mt-1">{text}</p>
    </div>
  );
};

const SessionDetails = () => {
  const { id } = useParams();
  const axiosSecure = useAxiosSecure();
  const { role, email, user } = UseAuth();

  const [reviewRating, setReviewRating] = useState(0);

  const {
    data: session,
    isLoading: sessionLoading,
    error: sessionError,
  } = useQuery({
    queryKey: ["session", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/sessions/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const {
    data: reviews = [],
    isLoading: reviewsLoading,
    refetch: refetchReviews,
  } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/reviews/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const registrationClosed =
    session?.registrationEnd && new Date(session.registrationEnd) < new Date();

  const canBook = !registrationClosed && role === "student" && !!email;

  const averageRating = getAverageRating(reviews);

  const handleBookNow = async () => {
    if (!canBook) return;

    try {
      const res = await axiosSecure.post("/bookings", {
        sessionId: session._id,
        studentEmail: email,
        tutorEmail: session.tutorEmail,
      });

      Swal.fire({
        icon: res.data.success ? "success" : "error",
        title: res.data.success ? "Booked!" : "Failed!",
        text: res.data.message,
        customClass: {
          confirmButton:
            "btn bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0",
        },
        buttonsStyling: false,
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.response?.data?.message || "Booking failed",
        customClass: {
          confirmButton:
            "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white",
        },
        buttonsStyling: false,
      });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const comment = form.comment.value.trim();

    if (!comment || reviewRating < 1 || reviewRating > 5) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid!",
        text: "Please write a comment and select a rating.",
        customClass: {
          confirmButton:
            "btn bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0",
        },
        buttonsStyling: false,
      });
    }

    try {
      await axiosSecure.post("/reviews", {
        sessionId: session._id,
        studentEmail: email,
        studentName: user?.displayName || "Anonymous",
        comment,
        rating: reviewRating,
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Review submitted successfully.",
        customClass: {
          confirmButton:
            "btn btn-success bg-gradient-to-r from-green-500 to-emerald-600 text-white",
        },
        buttonsStyling: false,
        timer: 2000,
      });

      form.reset();
      setReviewRating(0);
      refetchReviews();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.response?.data?.message || "Review failed",
        customClass: {
          confirmButton:
            "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white",
        },
        buttonsStyling: false,
      });
    }
  };

  if (sessionLoading) {
    return <LoadingSpinner />;
  }

  if (sessionError || !session) {
    return (
      <div className="min-h-screen bg-base-200 text-base-content flex items-center justify-center px-4">
        <div className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-3" />
          <h2 className="text-xl font-bold">Session not found</h2>
          <p className="text-base-content/60 mt-2">
            This session could not be loaded. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-base-200 text-base-content transition-colors duration-300"
      >
        {/* Hero */}
        <section className="relative min-h-[560px] overflow-hidden">
          {session.image || session.imageUrl ? (
            <img
              src={session.image || session.imageUrl}
              alt={session.title || "Session"}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.src = placeholderImage;
              }}
            />
          ) : (
            <img
              src={placeholderImage}
              alt="Session"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/90 via-purple-400/85 to-pink-300/75"></div>
          <div className="absolute inset-0 bg-black/10"></div>

          <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/20 rounded-full blur-3xl"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
            <motion.div
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-4xl text-white"
            >
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-md rounded-full px-4 py-2 text-sm mb-6">
                {registrationClosed ? (
                  <>
                    <XCircle className="w-4 h-4 text-red-200" />
                    Registration Closed
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-200" />
                    Registration Open
                  </>
                )}
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                {session.title || "Untitled Session"}
              </h1>

              <p className="text-white/90 text-lg md:text-xl mt-6 max-w-3xl leading-relaxed">
                {session.description ||
                  "Explore this study session, review class details, book your seat, and read student feedback."}
              </p>

              <div className="flex flex-wrap gap-3 mt-8">
                <span className="inline-flex items-center gap-2 bg-white text-indigo-700 px-4 py-2 rounded-xl font-semibold">
                  <User className="w-4 h-4" />
                  {session.tutorName || session.tutorEmail || "Tutor N/A"}
                </span>

                <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-md px-4 py-2 rounded-xl font-semibold">
                  <StarRating rating={averageRating} size={16} />
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                </span>

                <span className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-md px-4 py-2 rounded-xl font-semibold">
                  <DollarSign className="w-4 h-4" />
                  {formatFee(session)}
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
          {/* Floating Info */}
          <section className="grid grid-cols-1 md:grid-cols-4 gap-5 -mt-28 relative z-10">
            <InfoCard
              icon={Calendar}
              label="Registration Starts"
              value={formatDate(session.registrationStart)}
              colorClass="bg-gradient-to-br from-indigo-500 to-purple-600"
            />

            <InfoCard
              icon={Calendar}
              label="Registration Ends"
              value={formatDate(session.registrationEnd)}
              colorClass="bg-gradient-to-br from-purple-500 to-pink-600"
            />

            <InfoCard
              icon={Clock}
              label="Duration"
              value={session.duration ? `${session.duration} hours` : "N/A"}
              colorClass="bg-gradient-to-br from-blue-500 to-indigo-600"
            />

            <InfoCard
              icon={DollarSign}
              label="Session Fee"
              value={formatFee(session)}
              colorClass="bg-gradient-to-br from-green-500 to-emerald-600"
            />
          </section>

          {/* Main Details */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview */}
              <motion.section
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-6 md:p-8"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center">
                    <BookOpen className="w-6 h-6" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-base-content">
                      Session Overview
                    </h2>
                    <p className="text-base-content/60 text-sm">
                      Complete information about this study session.
                    </p>
                  </div>
                </div>

                <p className="text-base-content/75 leading-relaxed text-lg">
                  {session.description ||
                    "No description is available for this session."}
                </p>
              </motion.section>

              {/* Timeline */}
              <motion.section
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-6 md:p-8"
              >
                <h2 className="text-2xl font-bold mb-7 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-indigo-600" />
                  Session Timeline
                </h2>

                <div className="relative pl-4">
                  <div className="absolute left-[13px] top-3 bottom-3 w-1 rounded-full bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500"></div>

                  <div className="space-y-8">
                    <TimelineItem
                      icon={Calendar}
                      title="Registration Starts"
                      value={formatDate(session.registrationStart)}
                      colorClass="bg-indigo-600"
                    />

                    <TimelineItem
                      icon={Calendar}
                      title="Registration Ends"
                      value={formatDate(session.registrationEnd)}
                      colorClass="bg-purple-600"
                    />

                    <TimelineItem
                      icon={Clock}
                      title="Class Starts"
                      value={formatDate(getClassStart(session))}
                      colorClass="bg-pink-600"
                    />

                    <TimelineItem
                      icon={Clock}
                      title="Class Ends"
                      value={formatDate(getClassEnd(session))}
                      colorClass="bg-orange-500"
                    />
                  </div>
                </div>
              </motion.section>

              {/* Reviews */}
              <motion.section
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-6 md:p-8"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <MessageSquare className="w-6 h-6 text-indigo-600" />
                      Student Reviews
                    </h2>

                    <p className="text-base-content/60 mt-1">
                      See what students are saying about this session.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 bg-base-200 border border-base-300 rounded-2xl px-4 py-2">
                    <StarRating rating={averageRating} />
                    <span className="font-semibold text-sm">
                      {averageRating.toFixed(1)}
                    </span>
                  </div>
                </div>

                {reviewsLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                  </div>
                ) : reviews.length === 0 ? (
                  <EmptyState
                    title="No reviews yet"
                    text="Reviews will appear here after students submit feedback."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {reviews.map((review, index) => (
                      <ReviewCard
                        key={review._id || `review-${index}`}
                        review={review}
                        index={index}
                      />
                    ))}
                  </div>
                )}

                {role === "student" && email && (
                  <form
                    onSubmit={handleReviewSubmit}
                    className="mt-8 bg-base-200 border border-base-300 rounded-3xl p-5 md:p-6 space-y-4"
                  >
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <NotebookPen className="w-5 h-5 text-indigo-600" />
                        Write a Review
                      </h3>

                      <p className="text-sm text-base-content/60 mt-1">
                        Share your learning experience with other students.
                      </p>
                    </div>

                    <div>
                      <label className="label text-sm font-medium text-base-content/80">
                        Your Rating
                      </label>
                      <RatingInput value={reviewRating} onChange={setReviewRating} />
                    </div>

                    <div>
                      <label className="label text-sm font-medium text-base-content/80">
                        Your Comment
                      </label>

                      <textarea
                        name="comment"
                        placeholder="Share your experience..."
                        className="textarea textarea-bordered w-full bg-base-100 text-base-content focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                        rows={4}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0"
                    >
                      Submit Review
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                )}
              </motion.section>
            </div>

            {/* Right Sticky Booking Panel */}
            <aside className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="lg:sticky lg:top-24 bg-base-100 border border-base-300 rounded-3xl shadow-xl overflow-hidden"
              >
                <div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <h2 className="text-2xl font-bold">Book This Session</h2>
                  <p className="text-white/80 mt-1">
                    Reserve your seat before registration closes.
                  </p>
                </div>

                <div className="p-6 space-y-5">
                  <div className="rounded-3xl bg-base-200 border border-base-300 p-5">
                    <p className="text-sm text-base-content/50">Tutor</p>
                    <p className="font-bold text-base-content flex items-center gap-2 mt-1">
                      <User className="w-4 h-4 text-indigo-600" />
                      {session.tutorName || session.tutorEmail || "N/A"}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-base-200 border border-base-300 p-5">
                    <p className="text-sm text-base-content/50">Fee</p>
                    <p className="font-bold text-base-content flex items-center gap-2 mt-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      {formatFee(session)}
                    </p>
                  </div>

                  <div className="rounded-3xl bg-base-200 border border-base-300 p-5">
                    <p className="text-sm text-base-content/50">Status</p>

                    {registrationClosed ? (
                      <p className="font-bold text-error flex items-center gap-2 mt-1">
                        <XCircle className="w-4 h-4" />
                        Registration Closed
                      </p>
                    ) : (
                      <p className="font-bold text-success flex items-center gap-2 mt-1">
                        <CheckCircle className="w-4 h-4" />
                        Registration Open
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleBookNow}
                    disabled={!canBook}
                    className={`btn w-full text-lg ${
                      canBook
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0"
                        : "btn-disabled"
                    }`}
                  >
                    {registrationClosed
                      ? "Registration Closed"
                      : canBook
                      ? "Book Now"
                      : "Login as Student to Book"}
                  </button>

                  <div className="flex items-start gap-3 text-sm text-base-content/60 bg-base-200 border border-base-300 rounded-2xl p-4">
                    <ShieldCheck className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                    <p>
                      After booking, this session will appear in your student
                      dashboard where you can view materials and create notes.
                    </p>
                  </div>
                </div>
              </motion.div>
            </aside>
          </section>

          {/* Bottom Support */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-lg">
              <GraduationCap className="w-8 h-8 text-indigo-600 mb-3" />
              <h3 className="font-bold text-lg">Guided Learning</h3>
              <p className="text-base-content/60 text-sm mt-2">
                Learn from tutors with structured session content.
              </p>
            </div>

            <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-lg">
              <BookOpen className="w-8 h-8 text-purple-600 mb-3" />
              <h3 className="font-bold text-lg">Study Resources</h3>
              <p className="text-base-content/60 text-sm mt-2">
                Access uploaded materials after booking the session.
              </p>
            </div>

            <div className="bg-base-100 border border-base-300 rounded-3xl p-6 shadow-lg">
              <NotebookPen className="w-8 h-8 text-pink-600 mb-3" />
              <h3 className="font-bold text-lg">Personal Notes</h3>
              <p className="text-base-content/60 text-sm mt-2">
                Create and manage session-based notes from your dashboard.
              </p>
            </div>
          </section>
        </main>
      </motion.div>
    </AnimatePresence>
  );
};

export default SessionDetails;