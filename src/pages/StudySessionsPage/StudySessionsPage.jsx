import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/UseAxiosSecure";
import { Card, CardContent } from "../../Components/UI/card";
import { Button } from "../../Components/UI/button";
import { Link, Navigate } from "react-router";
import Swal from "sweetalert2";
import UseAuth from "../../Hooks/UseAuth";

const StudySessionsPage = () => {
  const axiosSecure = useAxiosSecure();
  const { role } = UseAuth(); // get current role (student/tutor/admin)

  //  if not student, redirect to dashboard
  if (role !== "student") {
    return <Navigate to="/dashboard" replace />;
  }


  // fetch only approved sessions
  const { data: sessions = [], isLoading, isError } = useQuery({
    queryKey: ["approvedSessions"],
    queryFn: async () => {
      const res = await axiosSecure.get("/sessions?status=approved");
      return res.data;
    },
  });

  // show error toast if fetch fails
  if (isError) {
    Swal.fire("Error!", "Failed to load study sessions", "error");
  }

  const getStatus = (endDate) => {
    return new Date(endDate) < new Date() ? "Closed" : "Ongoing";
  };

  if (isLoading) {
    return <p className="text-center mt-10">Loading sessions...</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Available Study Sessions</h2>

      {sessions.length === 0 ? (
        <p className="text-center text-gray-500">
          No approved sessions available yet.
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <Card key={session._id} className="shadow-lg hover:shadow-2xl transition rounded-2xl">
              <CardContent className="p-6 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{session.title}</h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{session.description}</p>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${getStatus(session.registrationEnd) === "Ongoing"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                      }`}
                  >
                    {getStatus(session.registrationEnd)}
                  </span>
                </div>

                <div className="mt-4">
                  <Link to={`/study-sessions/${session._id}`}>
                    <Button className="w-full">Read More</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudySessionsPage;
