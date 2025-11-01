
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Calendar, Clock, DollarSign, User, BookOpen } from "lucide-react";
import Swal from "sweetalert2";
import { useEffect } from "react";

import { Button } from "../../../Components/UI/button";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";

// Loading Spinner (Cool one you liked)
const LoadingSpinner = () => (
   <div className="pt-20 min-h-screen flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
          <Clock className="w-12 h-12 text-indigo-600" />
        </motion.div>
      </div>
);

// Star Rating Display
const StarRating = ({ rating, size = 16 }) => (
  <div className="flex items-center gap-1">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={size}
        className={i < rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}
      />
    ))}
  </div>
);

const SessionDetails = () => {
  const { id } = useParams();
  const axiosSecure = useAxiosSecure();
  const { role, email, user } = UseAuth();

  // Fetch Session
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
  });

  // Fetch Reviews
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
  });

  // Registration Status
  const registrationClosed =
    session?.registrationEnd && new Date(session.registrationEnd) < new Date();
  const canBook = !registrationClosed && role === "student" && !!email;

  // Book Now
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
      });
    } catch (err) {
      Swal.fire("Error!", err.response?.data?.message || "Booking failed", "error");
    }
  };

  // Submit Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const comment = form.comment.value.trim();
    const rating = Number(form.rating.value);

    if (!comment || rating < 1 || rating > 5) {
      return Swal.fire("Invalid!", "Comment and rating (1-5) required", "warning");
    }

    try {
      await axiosSecure.post("/reviews", {
        sessionId: session._id,
        studentEmail: email,
        studentName: user?.displayName || "Anonymous",
        comment,
        rating,
      });
      Swal.fire("Success!", "Review submitted", "success");
      form.reset();
      refetchReviews();
    } catch (err) {
      Swal.fire("Error!", err.response?.data?.message || "Review failed", "error");
    }
  };

  // Loading or Error
  if (sessionLoading) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (sessionError || !session) {
    return (
      <div className="pt-20 min-h-screen text-center text-red-600">
        <p>Session not found or failed to load.</p>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-20 min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
      >
        <div className="max-w-5xl mx-auto p-4 space-y-8">
          {/* Session Image + Header */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={session.image || "https://via.placeholder.com/1200x400?text=Session+Image"}
              alt={session.title}
              className="w-full h-64 md:h-80 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl md:text-4xl font-bold">{session.title}</h1>
              <p className="flex items-center gap-2 mt-1">
                <User size={20} /> {session.tutorName}
              </p>
              <p className="flex items-center gap-1 mt-1">
                <StarRating rating={Math.round(session.averageRating || 0)} />
                <span className="ml-1 text-sm">({reviews.length} reviews)</span>
              </p>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Details */}
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white p-6 rounded-2xl shadow-lg"
            >
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BookOpen className="text-indigo-600" /> Session Details
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2">
                  <Calendar className="text-purple-600" />
                  <strong>Registration:</strong>{" "}
                  {new Date(session.registrationStart).toLocaleDateString()} -{" "}
                  {new Date(session.registrationEnd).toLocaleDateString()}
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="text-pink-600" />
                  <strong>Class:</strong>{" "}
                  {new Date(session.classStartDate).toLocaleDateString()} -{" "}
                  {new Date(session.classEndDate).toLocaleDateString()}
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="text-indigo-600" />
                  <strong>Duration:</strong> {session.duration} hours
                </li>
                <li className="flex items-center gap-2">
                  <DollarSign className="text-green-600" />
                  <strong>Fee:</strong>{" "}
                  {session.registrationFee === 0 ? (
                    <span className="text-green-600 font-bold">Free</span>
                  ) : (
                    `$${session.registrationFee}`
                  )}
                </li>
              </ul>

              <Button
                onClick={handleBookNow}
                disabled={!canBook}
                className={`mt-6 w-full font-bold text-lg transition-all ${
                  canBook
                    ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                {registrationClosed
                  ? "Registration Closed"
                  : canBook
                  ? "Book Now"
                  : "Login as Student to Book"}
              </Button>
            </motion.div>

            {/* Right: Description */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white p-6 rounded-2xl shadow-lg"
            >
              <h2 className="text-xl font-bold mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">
                {session.description || "No description available."}
              </p>
            </motion.div>
          </div>

          {/* Reviews Section */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-2xl shadow-lg"
          >
            <h2 className="text-2xl font-bold mb-4">Student Reviews</h2>

            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No reviews yet. Be the first!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-l-4 border-indigo-500 pl-4 py-3 bg-gray-50 rounded-r-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{r.studentName}</p>
                        <p className="text-gray-600 mt-1">{r.comment}</p>
                      </div>
                      <StarRating rating={r.rating} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Review Form */}
            {role === "student" && email && (
              <form onSubmit={handleReviewSubmit} className="mt-6 space-y-4 p-4 bg-indigo-50 rounded-lg">
                <textarea
                  name="comment"
                  placeholder="Share your experience..."
                  className="w-full p-3 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows="3"
                  required
                />
                <div className="flex gap-3 items-center">
                  <input
                    type="number"
                    name="rating"
                    min="1"
                    max="5"
                    placeholder="Rate 1-5"
                    className="w-24 p-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700"
                  >
                    Submit Review
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SessionDetails;
