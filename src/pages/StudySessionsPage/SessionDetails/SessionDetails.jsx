import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Star, Calendar, Clock, DollarSign, User } from "lucide-react";
import Swal from "sweetalert2";
import { useEffect } from "react";


import { Button } from "../../../Components/UI/button";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";


const SessionDetails = () => {
  const { id } = useParams();
  const axiosSecure = useAxiosSecure();
  const { role, email, user } = UseAuth();

  // Debug auth info
  // useEffect(() => {
  //   console.log("DEBUG ROLE/EMAIL:", { role, email, user });
  // }, [role, email, user]);

  // Fetch session
  const { data: session, isLoading } = useQuery({
    queryKey: ["session", id],
    queryFn: async () => (await axiosSecure.get(`/sessions/${id}`)).data,
  });

  // Fetch reviews
  const { data: reviews = [], refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: async () => (await axiosSecure.get(`/reviews/${id}`)).data,
  });

  if (isLoading) return <p className="text-center">Loading session details...</p>;
  if (!session) return <p className="text-center">Session not found.</p>;

  const registrationClosed =
    session.registrationEnd && new Date(session.registrationEnd) < new Date();
  const canBook = !registrationClosed && role === "student" && !!email;

  // Book Now Handler
  const handleBookNow = async () => {
    try {
      const res = await axiosSecure.post("/bookings", {
        sessionId: session._id.toString(),
        studentEmail: email,
        tutorEmail: session.tutorEmail,
      });

      Swal.fire(
        res.data.success ? "Booked!" : "Oops!",
        res.data.message || "Something went wrong",
        res.data.success ? "success" : "error"
      );
    } catch (err) {
      console.error("📌 Booking error:", err);
      Swal.fire("Error!", err.response?.data?.message || err.message, "error");
    }
  };

  // Review Submit
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const comment = e.target.comment.value;
    const rating = Number(e.target.rating.value);

    if (!comment || !rating) {
      return Swal.fire("Error!", "Please fill comment & rating", "error");
    }

    try {
      await axiosSecure.post("/reviews", {
        sessionId: session._id.toString(),
        studentEmail: email,
        studentName: user?.displayName || "Anonymous",
        comment,
        rating,
      });
      Swal.fire("Success!", "Review submitted", "success");
      e.target.reset();
      refetchReviews();
    } catch (err) {
      console.error("📌 Review error:", err);
      Swal.fire("Error!", err.response?.data?.message || err.message, "error");
    }
  };

  return (
    <div className="pt-20 min-h-screen max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white">
        <h1 className="text-3xl font-bold">{session.title}</h1>
        <p className="flex items-center gap-2">
          <User size={18} /> {session.tutorName || "Unknown Tutor"}
        </p>
        <p className="flex items-center gap-2">
          <Star size={18} className="text-yellow-400" /> Avg:{" "}
          {session.averageRating || "N/A"}
        </p>
      </div>

      {/* Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center gap-2">
              <Calendar size={18} /> Registration:{" "}
              {session.registrationStart
                ? new Date(session.registrationStart).toLocaleDateString()
                : "?"}{" "}
              -{" "}
              {session.registrationEnd
                ? new Date(session.registrationEnd).toLocaleDateString()
                : "?"}
            </li>
            <li className="flex items-center gap-2">
              <Calendar size={18} /> Class:{" "}
              {session.classStartDate
                ? new Date(session.classStartDate).toLocaleDateString()
                : "?"}{" "}
              -{" "}
              {session.classEndDate
                ? new Date(session.classEndDate).toLocaleDateString()
                : "?"}
            </li>
            <li className="flex items-center gap-2">
              <Clock size={18} /> Duration: {session.duration || "N/A"} hours
            </li>
            <li className="flex items-center gap-2">
              <DollarSign size={18} /> Fee:{" "}
              {session.registrationFee === 0
                ? "Free"
                : session.registrationFee
                ? `$${session.registrationFee}`
                : "N/A"}
            </li>
          </ul>
          <div className="mt-6">
            <Button onClick={handleBookNow} disabled={!canBook} className="w-full">
              {registrationClosed
                ? "Registration Closed"
                : canBook
                ? "Book Now"
                : "Login as Student to Book"}
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="font-bold mb-2">Description</h2>
          <p>{session.description || "No description"}</p>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white p-6 rounded-2xl shadow-md space-y-4">
        <h2 className="text-2xl font-bold">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet</p>
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="border p-3 rounded-md bg-gray-50">
              <p className="font-semibold">{r.studentName}</p>
              <p>{r.comment}</p>
              <p className="text-yellow-600 flex items-center gap-1">
                <Star size={16} /> {r.rating}
              </p>
            </div>
          ))
        )}

        {role === "student" && email && (
          <form onSubmit={handleReviewSubmit} className="space-y-3 mt-4">
            <textarea
              name="comment"
              placeholder="Write your review..."
              className="w-full border p-2 rounded"
              required
            />
            <input
              type="number"
              name="rating"
              placeholder="Rating 1-5"
              min="1"
              max="5"
              className="w-24 border p-2 rounded"
              required
            />
            <Button type="submit">Submit Review</Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default SessionDetails;
