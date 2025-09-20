import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";



import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";
import { Button } from "../../../Components/UI/button";

const SessionDetails = () => {
  const { id } = useParams();
  const axiosSecure = useAxiosSecure();
  const { role, email } = UseAuth(); // get logged-in user info

  // Fetch session info
  const { data: session, isLoading } = useQuery({
    queryKey: ["session", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/sessions/${id}`);
      return res.data;
    },
  });

  // Fetch session reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ["sessionReviews", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/reviews/${id}`);
      return res.data;
    },
  });

  if (isLoading) return <p>Loading session details...</p>;

  const registrationClosed = new Date(session.registrationEnd) < new Date();
  const canBook = !registrationClosed && role === "student";

  const handleBookNow = () => {
    if (!canBook) return;
    if (session.registrationFee > 0) {
      // Redirect to payment page
      window.location.href = `/payment/${session._id}`;
    } else {
      // Book directly via API
      axiosSecure.post("/bookings", {
        sessionId: session._id,
        studentEmail: email,
        tutorEmail: session.tutorEmail,
      }).then(() => alert("Session booked successfully!"));
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{session.title}</h1>
      <p className="text-gray-700 mb-2">Tutor: {session.tutorName}</p>
      <p className="text-gray-700 mb-2">Average Rating: {session.averageRating || "N/A"}</p>
      <p className="mb-4">{session.description}</p>

      <ul className="mb-4">
        <li>Registration Start: {new Date(session.registrationStart).toLocaleDateString()}</li>
        <li>Registration End: {new Date(session.registrationEnd).toLocaleDateString()}</li>
        <li>Class Start: {new Date(session.classStart).toLocaleString()}</li>
        <li>Class End: {new Date(session.classEnd).toLocaleString()}</li>
        <li>Duration: {session.duration}</li>
        <li>Registration Fee: {session.registrationFee === 0 ? "Free" : `$${session.registrationFee}`}</li>
      </ul>

      <Button onClick={handleBookNow} disabled={!canBook}>
        {registrationClosed ? "Registration Closed" : "Book Now"}
      </Button>

      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-2">Reviews</h2>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <ul>
            {reviews.map((r) => (
              <li key={r._id} className="mb-2 border p-2 rounded">
                <p className="font-semibold">{r.studentName}</p>
                <p>{r.comment}</p>
                <p>Rating: {r.rating}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SessionDetails;
