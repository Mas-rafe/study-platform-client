import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/UseAxiosSecure";
import { Card, CardContent } from "../../Components/UI/card";
import { Button } from "../../Components/UI/button";

import Swal from "sweetalert2";
import UseAuth from "../../Hooks/UseAuth";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Link } from "react-router";

const StudySessionsPage = () => {
  const axiosSecure = useAxiosSecure();
  const { role, darkMode } = UseAuth();
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

  if (isError) {
    Swal.fire("Error!", "Failed to load study sessions", "error");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-xl font-medium">Loading sessions...</div>
      </div>
    );
  }

  const getStatus = (status, endDate) => {
    if (role === "admin") return status || "N/A";
    return endDate && new Date(endDate) < new Date() ? "Closed" : "Ongoing";
  };

  const totalPages = Math.ceil(sessions.length / itemsPerPage);
  const paginatedSessions = sessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const gradientBg = darkMode
    ? "bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900"
    : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500";

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`py-16 ${gradientBg} text-white`}
      >
        <div className="max-w-7xl mx-auto mt-4  sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Study Sessions</h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto opacity-90">
            Explore expert-led study sessions designed to boost your learning. Join live classes, access materials, and grow with the best tutors.
          </p>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {sessions.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 dark:text-gray-400 text-lg"
          >
            {role === "admin"
              ? "No sessions found."
              : "No approved sessions available yet."}
          </motion.p>
        ) : (
          <>
            {/* Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedSessions.map((session, index) => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Card className="h-full overflow-hidden rounded-2xl shadow-lg transition-all duration-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group-hover:shadow-2xl group-hover:border-transparent focus-within:ring-4 focus-within:ring-indigo-500">
                    <CardContent className="p-0 flex flex-col h-full">
                      {/* Image */}
                      <div className="relative overflow-hidden">
                        <img
                          src={session.image || "https://via.placeholder.com/400x200?text=No+Image"}
                          alt={session.title}
                          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity" />
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-grow">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                          {session.title || "Untitled Session"}
                        </h3>

                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                          <p>
                            <strong>Reg Start:</strong>{" "}
                            {session.registrationStart 
                              ? format(new Date(session.registrationStart), "MMM d, yyyy")
                              : "N/A"
                            }
                          </p>
                          <p>
                            <strong>Reg End:</strong>{" "}
                            {session.registrationEnd 
                              ? format(new Date(session.registrationEnd), "MMM d, yyyy")
                              : "N/A"
                            }
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="mt-3">
                          <span
                            className={`
                              inline-block px-3 py-1 text-xs font-bold rounded-full
                              ${
                                role === "admin"
                                  ? session.status === "approved"
                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                    : session.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                                    : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                  : getStatus(null, session.registrationEnd) === "Ongoing"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                              }
                            `}
                          >
                            {getStatus(session.status, session.registrationEnd)}
                          </span>
                        </div>

                        {/* Button */}
                        <div className="mt-4">
                          <Link to={`/session-details/${session._id}`} className="block">
                            <Button
                              variant="outline"
                              className={`
                                w-full font-medium transition-all border-2
                                ${darkMode 
                                  ? "border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white" 
                                  : "border-indigo-600 text-indigo-600 hover:bg-indigo-600 hover:text-white"
                                }
                              `}
                            >
                              Read More
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center items-center gap-2 mt-12"
              >
                <Button size="sm" variant="outline" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} className="border-2">
                  Prev
                </Button>

                {Array.from({ length: totalPages }, (_, i) => (
                  <Button
                    key={i + 1}
                    size="sm"
                    variant={currentPage === i + 1 ? "default" : "outline"}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`
                      border-2 font-medium
                      ${currentPage === i + 1 
                        ? "bg-indigo-600 text-white border-indigo-600" 
                        : darkMode
                          ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    {i + 1}
                  </Button>
                ))}

                <Button size="sm" variant="outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} className="border-2">
                  Next
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudySessionsPage;