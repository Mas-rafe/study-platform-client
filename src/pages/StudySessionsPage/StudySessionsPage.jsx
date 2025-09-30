import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/UseAxiosSecure";
import { Card, CardContent } from "../../Components/UI/card";
import { Button } from "../../Components/UI/button";
import { Link, Navigate } from "react-router";
import Swal from "sweetalert2";
import UseAuth from "../../Hooks/UseAuth";

const StudySessionsPage = () => {
  const axiosSecure = useAxiosSecure();
  const { role } = UseAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data: sessions = [], isLoading, isError } = useQuery({
    queryKey: ["studySessions", role],
    queryFn: async () => {
      if (role === "admin") {
        const res = await axiosSecure.get("/admin/sessions");
        return res.data;
      } else {
        const res = await axiosSecure.get("/sessions?status=approved");
        return res.data;
      }
    },
  });

  if (isError) Swal.fire("Error!", "Failed to load study sessions", "error");
  if (isLoading) return <p className="text-center mt-10">Loading sessions...</p>;

  const getStatus = (status, endDate) => {
    if (role === "admin") return status || "N/A";
    return new Date(endDate) < new Date() ? "Closed" : "Ongoing";
  };

  const totalPages = Math.ceil(sessions.length / itemsPerPage);
  const paginatedSessions = sessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Study Sessions</h2>

      {sessions.length === 0 ? (
        <p className="text-center text-gray-500">
          {role === "admin"
            ? "No sessions found."
            : "No approved sessions available yet."}
        </p>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedSessions.map((session) => (
              <Card
                key={session._id}
                className="shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl rounded-2xl overflow-hidden"
              >
                <CardContent
                  className="p-6 flex flex-col justify-between h-full"
                  style={{
                    background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)", // light gradient
                  }}
                >
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{session.title}</h3>
                    <p className="text-gray-700 text-sm mb-3 line-clamp-3">{session.description}</p>
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        role === "admin"
                          ? session.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : session.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                          : getStatus(null, session.registrationEnd) === "Ongoing"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {getStatus(session.status, session.registrationEnd)}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-col gap-2">
                    <Link to={`/session-details/${session._id}`}>
                      <Button className="w-full  text-blue-400  hover:bg-blue-50"> 
                        Read More
                      </Button>
                    </Link>
                    {role === "admin" && (
                      <span className="text-sm text-gray-500">ID: {session._id}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >
              Prev
            </Button>

            {Array.from({ length: totalPages }, (_, i) => (
              <Button
                key={i + 1}
                size="sm"
                variant={currentPage === i + 1 ? "solid" : "outline"}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default StudySessionsPage;
