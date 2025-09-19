import { useQuery } from "@tanstack/react-query";

import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";

const ManageSessions = () => {
  const axiosSecure = useAxiosSecure();

  // fetch sessions from backend
  const { data: sessions = [], refetch } = useQuery({
    queryKey: ["sessions"],
    queryFn: async () => {
      const res = await axiosSecure.get("/sessions/pending");
      return res.data;
    },
  });

// approve session
const handleApprove = async (id) => {
  const res = await axiosSecure.patch(`/sessions/${id}/approve`);
  if (res.data.success) {
    Swal.fire("Approved!", "Session has been approved.", "success");
    refetch();
  } else {
    Swal.fire("Oops!", res.data.message || "Something went wrong.", "error");
  }
};

// reject session
const handleReject = async (id) => {
  const res = await axiosSecure.patch(`/sessions/${id}/reject`);
  if (res.data.success) {
    Swal.fire("Rejected!", "Session has been rejected.", "error");
    refetch();
  } else {
    Swal.fire("Oops!", res.data.message || "Something went wrong.", "error");
  }
};

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Manage Sessions</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Tutor</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session, idx) => (
              <tr key={session._id}>
                <td>{idx + 1}</td>
                <td>{session.title}</td>
                <td>{session.tutorEmail}</td>
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
    </div>
  );
};

export default ManageSessions;
