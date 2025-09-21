import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import Swal from "sweetalert2";

const ManageSessions = () => {
  const axiosSecure = useAxiosSecure();

  // Fetch pending sessions
  const {
    data: pendingSessions = [],
    refetch: refetchPending,
    isLoading: loadingPending,
  } = useQuery({
    queryKey: ["pendingSessions"],
    queryFn: async () => {
      const res = await axiosSecure.get("/sessions/pending");
      return res.data;
    },
  });

  // Fetch all sessions (approved/rejected)
  const {
    data: allSessions = [],
    refetch: refetchAll,
    isLoading: loadingAll,
  } = useQuery({
    queryKey: ["allSessions"],
    queryFn: async () => {
      const res = await axiosSecure.get("/sessions");
      return res.data;
    },
  });

  if (loadingPending || loadingAll) return <p className="text-center mt-10">Loading sessions...</p>;

  // Approve session with modal for fee
  const handleApprove = async (session) => {
    const { value: formValues } = await Swal.fire({
      title: "Approve Session",
      html: `
        <label>Session Type:</label>
        <select id="sessionType" class="swal2-input">
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
        <input type="number" id="fee" class="swal2-input" placeholder="Fee" value="${session.registrationFee || 0}" />
      `,
      focusConfirm: false,
      preConfirm: () => {
        const type = document.getElementById("sessionType").value;
        const fee = Number(document.getElementById("fee").value) || 0;
        return { type, fee };
      },
    });

    if (!formValues) return;

    try {
      const res = await axiosSecure.patch(`/sessions/${session._id}/approve`, {
        fee: formValues.type === "free" ? 0 : formValues.fee,
      });
      if (res.data.success) {
        Swal.fire("Approved!", "Session has been approved.", "success");
        refetchPending();
        refetchAll();
      }
    } catch (err) {
      Swal.fire("Error!", err.message || "Something went wrong", "error");
    }
  };

  // Reject session
  const handleReject = async (id) => {
    try {
      const res = await axiosSecure.patch(`/sessions/${id}/reject`);
      if (res.data.success) {
        Swal.fire("Rejected!", "Session has been rejected.", "error");
        refetchPending();
        refetchAll();
      }
    } catch (err) {
      Swal.fire("Error!", err.message || "Something went wrong", "error");
    }
  };

  // Update approved session
  const handleUpdate = async (session) => {
    const { value: updates } = await Swal.fire({
      title: "Update Session",
      html: `
        <input id="title" class="swal2-input" placeholder="Title" value="${session.title}" />
        <input id="subject" class="swal2-input" placeholder="Subject" value="${session.subject}" />
        <input id="duration" type="number" class="swal2-input" placeholder="Duration" value="${session.duration}" />
        <input id="fee" type="number" class="swal2-input" placeholder="Fee" value="${session.registrationFee}" />
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          title: document.getElementById("title").value,
          subject: document.getElementById("subject").value,
          duration: Number(document.getElementById("duration").value) || 0,
          registrationFee: Number(document.getElementById("fee").value) || 0,
        };
      },
    });

    if (!updates) return;

    try {
      const res = await axiosSecure.patch(`/sessions/${session._id}`, updates);
      if (res.data.success) {
        Swal.fire("Updated!", "Session has been updated.", "success");
        refetchAll();
      }
    } catch (err) {
      Swal.fire("Error!", err.message || "Something went wrong", "error");
    }
  };

  // Delete session
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the session permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete!",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await axiosSecure.delete(`/sessions/${id}`);
        if (res.data.deletedCount > 0) {
          Swal.fire("Deleted!", "Session has been deleted.", "success");
          refetchAll();
          refetchPending();
        }
      } catch (err) {
        Swal.fire("Error!", err.message || "Something went wrong", "error");
      }
    }
  };

  return (
    <div className="p-6 space-y-8">
      {/* Pending Sessions Table */}
      <div>
        <h2 className="text-3xl font-bold mb-4">Pending Sessions</h2>
        {pendingSessions.length === 0 ? (
          <p className="text-center text-gray-500">No pending sessions.</p>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingSessions.map((session, idx) => (
                  <tr key={session._id}>
                    <td>{idx + 1}</td>
                    <td>{session.title}</td>
                    <td>{session.tutorName} ({session.tutorEmail})</td>
                    <td>{session.subject}</td>
                    <td>{session.duration} hr</td>
                    <td>{new Date(session.registrationEnd).toLocaleDateString()}</td>
                    <td className="flex gap-2">
                      <button onClick={() => handleApprove(session)} className="btn btn-success btn-sm">Approve</button>
                      <button onClick={() => handleReject(session._id)} className="btn btn-error btn-sm">Reject</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approved/Rejected Sessions Table */}
      <div>
        <h2 className="text-3xl font-bold mb-4">All Sessions</h2>
        {allSessions.length === 0 ? (
          <p className="text-center text-gray-500">No sessions available.</p>
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
                {allSessions.map((session, idx) => (
                  <tr key={session._id}>
                    <td>{idx + 1}</td>
                    <td>{session.title}</td>
                    <td>{session.tutorName} ({session.tutorEmail})</td>
                    <td>{session.subject}</td>
                    <td>{session.duration} hr</td>
                    <td>{session.registrationEnd ? new Date(session.registrationEnd).toLocaleDateString() : "N/A"}</td>
                    <td>
                      <span
                        className={`badge ${
                          session.status === "approved" ? "badge-success" :
                          session.status === "rejected" ? "badge-error" : "badge-warning"
                        }`}
                      >
                        {session.status}
                      </span>
                    </td>
                    <td className="flex gap-2">
                      {session.status === "approved" ? (
                        <>
                          <button onClick={() => handleUpdate(session)} className="btn btn-primary btn-sm">Update</button>
                          <button onClick={() => handleDelete(session._id)} className="btn btn-error btn-sm">Delete</button>
                        </>
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
    </div>
  );
};

export default ManageSessions;
