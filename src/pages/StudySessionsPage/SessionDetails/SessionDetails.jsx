import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Star, Calendar, Clock, DollarSign, User } from "lucide-react";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";
import { Button } from "../../../Components/UI/button";
import Swal from "sweetalert2";

const SessionDetails = () => {
  const { id } = useParams();
  const axiosSecure = useAxiosSecure();
  const { role, email, user } = UseAuth();

  // Fetch session info
  const { data: session, isLoading } = useQuery({
    queryKey: ["session", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/sessions/${id}`);
      return res.data;
    },
  });

  // Fetch reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ["sessionReviews", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/reviews/${id}`);
      return res.data;
    },
  });

  if (isLoading) return <p className="text-center">Loading session details...</p>;

  // Parse ISO dates safely
  const parseDate = (dateStr, timeStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    if (timeStr) {
      const [h, m] = timeStr.split(":");
      date.setHours(parseInt(h), parseInt(m));
    }
    return date;
  };

  const regStart = parseDate(session.registrationStart)?.toLocaleDateString() || "N/A";
  const regEnd = parseDate(session.registrationEnd)?.toLocaleDateString() || "N/A";
  const classStart = parseDate(session.classStart, session.classStartTime)?.toLocaleString() || "N/A";
  const classEnd = parseDate(session.classEnd)?.toLocaleString() || "N/A";
  const duration = session.duration || "N/A";
  const fee = session.registrationFee != null ? (session.registrationFee === 0 ? "Free" : `$${session.registrationFee}`) : "N/A";
  const description = session.description || "No description available.";

  const registrationClosed = session.registrationEnd && new Date(session.registrationEnd) < new Date();
  const canBook = !registrationClosed && role === "student";

  const handleBookNow = async () => {
    if (!canBook) return;

    const bookingData = {
      sessionId: session?._id?.toString(),
      studentEmail: email || user?.email, // fallback if email is undefined
      tutorEmail: session?.tutorEmail,
    };

    console.log("Booking payload →", bookingData);

    // Validate before sending
    if (!bookingData.sessionId || !bookingData.studentEmail || !bookingData.tutorEmail) {
      Swal.fire("Error!", "Booking data is incomplete. Please try again.", "error");
      return;
    }

    try {
      const res = await axiosSecure.post("/bookings", bookingData);

      if (res.data.success) {
        Swal.fire("Booked!", "Session booked successfully!", "success");
      } else {
        Swal.fire("Oops!", res.data.message || "Booking failed", "error");
      }
    } catch (err) {
      Swal.fire("Error!", err.response?.data?.message || err.message, "error");
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-xl text-white">
        <h1 className="text-3xl font-bold mb-2">{session.title || "Untitled Session"}</h1>
        <p className="flex items-center gap-2 text-lg">
          <User size={18} /> {session.tutorName || "N/A"}
        </p>
        <p className="flex items-center gap-2">
          <Star size={18} className="text-yellow-400" /> Average Rating: {session.averageRating || "N/A"}
        </p>
      </div>

      {/* Session Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Session Info</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-center gap-2">
              <Calendar size={18} /> Registration: {regStart} - {regEnd}
            </li>
            <li className="flex items-center gap-2">
              <Clock size={18} /> Class: {classStart} → {classEnd}
            </li>
            <li className="flex items-center gap-2">
              <Clock size={18} /> Duration: {duration} hours
            </li>
            <li className="flex items-center gap-2">
              <DollarSign size={18} /> Fee: {fee}
            </li>
          </ul>
          <div className="mt-6">
            <Button onClick={handleBookNow} disabled={!canBook} className="w-full">
              {registrationClosed ? "Registration Closed" : "Book Now"}
            </Button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Description</h2>
          <p className="text-gray-700">{description}</p>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="border p-4 rounded-lg shadow-sm bg-gray-50">
                <p className="font-semibold">{r.studentName}</p>
                <p className="text-gray-600">{r.comment}</p>
                <p className="flex items-center gap-1 text-sm text-yellow-600">
                  <Star size={16} /> {r.rating}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Add Review Form */}
        {role === "student" && (
          <div className="mt-6">
            <h3 className="text-lg font-bold mb-2">Leave a Review</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const comment = e.target.comment.value;
                const rating = e.target.rating.value;
                try {
                  await axiosSecure.post("/reviews", {
                    sessionId: session._id,
                    studentEmail: email,
                    studentName: user?.displayName || "Anonymous",
                    comment,
                    rating,
                  });
                  Swal.fire("Thank you!", "Your review has been submitted.", "success");
                  e.target.reset();
                } catch (err) {
                  Swal.fire("Error!", err.response?.data?.message || err.message, "error");
                }
              }}
              className="space-y-3"
            >
              <textarea name="comment" placeholder="Write your review..." className="w-full border p-2 rounded" required />
              <input type="number" name="rating" placeholder="Rating (1-5)" min="1" max="5" className="w-24 border p-2 rounded" required />
              <Button type="submit">Submit Review</Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionDetails;
