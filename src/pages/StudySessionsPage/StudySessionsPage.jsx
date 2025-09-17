// src/Pages/StudySessions/StudySessionsPage.jsx
import { useEffect, useState } from "react";

import axios from "axios";
import { Card, CardContent } from "../../components/ui/card";

import Swal from "sweetalert2";
import { Link } from "react-router";
import { Button } from "../../Components/UI/button";

const StudySessionsPage = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    axios
      .get("https://your-server-url/studySessions?status=approved")
      .then((res) => {
        setSessions(res.data);
      })
      .catch(() => {
        Swal.fire("Error!", "Failed to load study sessions", "error");
      });
  }, []);

  // helper function to check session status
  const getStatus = (endDate) => {
    return new Date(endDate) < new Date() ? "Closed" : "Ongoing";
  };

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
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {session.description}
                  </p>
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      getStatus(session.registrationEnd) === "Ongoing"
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
