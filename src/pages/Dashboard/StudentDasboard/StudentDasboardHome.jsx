import { useState } from "react";
import { useQuery } from "@tanstack/react-query";


import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";
import { Button } from "../../../Components/UI/button";
import { Link } from "react-router";

const StudentDashboardHome = () => {
  const axiosSecure = useAxiosSecure();
  const { user, email } = UseAuth();

  const [selectedSessionForMaterials, setSelectedSessionForMaterials] = useState(null);
  const [materialsForSession, setMaterialsForSession] = useState([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  // --- 1) Student stats
  const { data: stats = {}, isLoading: statsLoading } = useQuery({
    queryKey: ["studentStats", email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/student/stats/${email}`);
      return res.data;
    },
    enabled: !!email,
  });

  // --- 2) Booked sessions (server returns booking + embedded session data)
  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["studentBookings", email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/bookings/student/${email}`);
      return res.data;
    },
    enabled: !!email,
  });

  // --- 3) Student notes
  const {
    data: notes = [],
    isLoading: notesLoading,
    refetch: refetchNotes,
  } = useQuery({
    queryKey: ["studentNotes", email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/notes/student/${email}`);
      return res.data;
    },
    enabled: !!email,
  });

 
  // --- Request materials for a booked session
  const viewMaterials = async (sessionId) => {
    if (!sessionId) return;
    setMaterialsLoading(true);
    setSelectedSessionForMaterials(sessionId);
    try {
      const res = await axiosSecure.get(`/materials/session/${sessionId}`);
      setMaterialsForSession(res.data || []);
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
      setMaterialsForSession([]);
    } finally {
      setMaterialsLoading(false);
    }
  };

  // --- helper: render loading states
  if (statsLoading || bookingsLoading || notesLoading) {
    return <p className="text-center p-6">Loading your dashboard...</p>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.displayName || "Student"}</h1>
          <p className="text-sm text-gray-500">Overview of your bookings, notes and materials.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => window.scrollTo({ top: 9999, behavior: "smooth" })}>Create Note</Button>
          <Button onClick={() => document.getElementById("my-notes-section")?.scrollIntoView({ behavior: "smooth" })}>My Notes</Button>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="text-sm text-gray-500">Bookings</div>
          <div className="text-2xl font-bold">{stats?.totalBookings ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="text-sm text-gray-500">Reviews Given</div>
          <div className="text-2xl font-bold">{stats?.totalReviews ?? 0}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow">
          <div className="text-sm text-gray-500">Materials Available</div>
          <div className="text-2xl font-bold">{stats?.totalMaterials ?? 0}</div>
        </div>
      </section>

      {/* Booked sessions */}
      <section className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-2">Your Booked Sessions</h2>
        {bookings.length === 0 ? (
          <p className="text-gray-500">You have no bookings yet.</p>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
              // backend should embed session info into booking as `session`
              const session = b.session || b.sessionData || (b.sessionId ? { _id: b.sessionId, title: b.title } : null);
              const sessionId = session?._id?.toString?.() ?? b.sessionId;
              return (
                <div key={b._id} className="border p-4 rounded-md flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-semibold">{session?.title || "Unknown Session"}</div>
                    <div className="text-sm text-gray-500">
                      Tutor: {session?.tutorName || b.tutorEmail} • Fee: {session?.registrationFee === 0 ? "Free" : `$${session?.registrationFee}`}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      Reg: {session?.registrationStart ? new Date(session.registrationStart).toLocaleDateString() : "N/A"} →
                      {session?.registrationEnd ? " " + new Date(session.registrationEnd).toLocaleDateString() : " N/A"}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/dashboard/student/bookings/${session._id}`}>
                      <button className="btn btn-sm bg-blue-500 text-white rounded-md">
                        View Details
                      </button>
                    </Link>
                    <Link to={`/dashboard/student/bookings/${sessionId}/materials`}>
                      <button className="btn btn-primary btn-sm">
                        View Materials
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Materials modal-like section */}
      {selectedSessionForMaterials && (
        <section className="bg-white p-4 rounded-xl shadow">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Materials for session: {selectedSessionForMaterials}</h3>
            <button className="btn btn-ghost" onClick={() => { setSelectedSessionForMaterials(null); setMaterialsForSession([]); }}>
              Close
            </button>
          </div>

          {materialsLoading ? (
            <p>Loading materials...</p>
          ) : materialsForSession.length === 0 ? (
            <p className="text-gray-500">No materials available for this session.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {materialsForSession.map((m) => (
                <div key={m._id} className="p-3 border rounded">
                  <div className="font-semibold">{m.title}</div>
                  <div className="text-sm text-gray-600 mb-2">{m.description}</div>

                  {/* show image if exists */}
                  {m.image && (
                    <div className="mb-2">
                      <img src={m.image} alt={m.title} className="w-full rounded" />
                      <a href={m.image} target="_blank" rel="noreferrer" download className="btn btn-outline btn-xs mt-2">Download</a>
                    </div>
                  )}

                  {/* link */}
                  {m.link && (
                    <div className="mt-2">
                      <a href={m.link} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                        Open resource link
                      </a>
                    </div>
                  )}

                  {/* fileUrl (server-stored file) */}
                  {m.fileUrl && (
                    <div className="mt-2">
                      <a href={m.fileUrl} target="_blank" rel="noreferrer" className="btn btn-sm">
                        Open File
                      </a>
                      <a href={m.fileUrl} download className="btn btn-sm btn-outline ml-2">
                        Download
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}


    
    </div>
  );
};

export default StudentDashboardHome;
