import { useQuery } from "@tanstack/react-query";

import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";
import { Link } from "react-router";

const MyBookings = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = UseAuth();

  // fetch bookings for logged-in student
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["myBookings", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/bookings/student/${user.email}`);
      return res.data;
    },
    enabled: !!user?.email, // only fetch when email exists
  });

  if (isLoading) return <p className="text-center">Loading your bookings…</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">📚 My Booked Sessions</h2>

      {bookings.length === 0 ? (
        <p className="text-gray-500">You haven’t booked any sessions yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {bookings.map((b) => (
            <div key={b._id} className="bg-white p-4 rounded-xl shadow-md">
              <h3 className="font-bold text-lg">{b.title}</h3>
              <p className="text-sm text-gray-600">Tutor: {b.tutorName}</p>
              <p className="text-sm">Fee: {b.fee === 0 ? "Free" : `$${b.fee}`}</p>
              <p className="text-sm">
                Reg: {new Date(b.regStartDate).toLocaleDateString()} →{" "}
                {new Date(b.regEndDate).toLocaleDateString()}
              </p>
              <p className="text-sm">
                Class: {new Date(b.classStartDate).toLocaleDateString()} →{" "}
                {new Date(b.classEndDate).toLocaleDateString()}
              </p>

              <div className="mt-3 flex gap-2">
                {/* View Details */}
                <Link to={`/dashboard/student/bookings/${b.sessionId}`}>
                  <button className="btn btn-sm btn-outline">
                    View Details
                  </button>
                </Link>

                {/* View Materials */}
                <Link to={`/dashboard/student/bookings/${b.sessionId}/materials`}>
                  <button className="btn btn-sm btn-primary">
                    View Materials
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
