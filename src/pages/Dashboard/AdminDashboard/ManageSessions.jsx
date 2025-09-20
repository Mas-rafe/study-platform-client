import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";

const ManageSessions = () => {
  const axiosSecure = useAxiosSecure();

  // fetch pending sessions from backend
  const { data: sessions = [], refetch, isLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await axiosSecure.get("/sessions/pending");
      return res.data;
    },
  });

  if (isLoading) return <p className="text-center mt-10">Loading sessions...</p>;

  const handleApprove = async (id) => {
    try {
      const res = await axiosSecure.patch(`/sessions/${id}/approve`);
      if (res.data.success) {
        Swal.fire("Approved!", "Session has been approved.", "success");
        refetch();
      } else {
        Swal.fire("Oops!", res.data.message || "Something went wrong.", "error");
      }
    } catch (err) {
      Swal.fire("Error!", err.message, "error");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await axiosSecure.patch(`/sessions/${id}/reject`);
      if (res.data.success) {
        Swal.fire("Rejected!", "Session has been rejected.", "error");
        refetch();
      } else {
        Swal.fire("Oops!", res.data.message || "Something went wrong.", "error");
      }
    } catch (err) {
      Swal.fire("Error!", err.message, "error");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Manage Pending Sessions</h2>
      {sessions.length === 0 ? (
        <p className="text-center text-gray-500">No pending sessions at the moment.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full table-auto border">
            <thead className="bg-gray-100">
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Tutor</th>
                <th>Subject</th>
                <th>Duration</th>
                <th>Registration Ends</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, idx) => (
                <tr key={session._id} className="hover:bg-gray-50">
                  <td>{idx + 1}</td>
                  <td>{session.title}</td>
                  <td>{session.tutorName} ({session.tutorEmail})</td>
                  <td>{session.subject}</td>
                  <td>{session.duration} hr</td>
                  <td>{session.registrationEnd ? new Date(session.registrationEnd).toLocaleDateString() : "N/A"}</td>
                  <td>
                    <span
                      className={`badge ${
                        session.status === "approved"
                          ? "badge-success"
                          : session.status === "rejected"
                          ? "badge-error"
                          : "badge-warning"
                      }`}
                    >
                      {session.status}
                    </span>
                  </td>
                  <td>
                    {session.status === "pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(session._id)}
                          className="btn btn-success btn-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(session._id)}
                          className="btn btn-error btn-sm"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageSessions;
