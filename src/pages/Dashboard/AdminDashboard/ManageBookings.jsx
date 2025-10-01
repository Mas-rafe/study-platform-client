import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import Swal from "sweetalert2";

const ManageBookings = () => {
  const axiosSecure = useAxiosSecure();

  // Fetch pending bookings
  const {
    data: pendingBookings = [],
    refetch: refetchPending,
    isLoading: loadingPending,
  } = useQuery({
    queryKey: ["pendingBookings"],
    queryFn: async () => {
      const res = await axiosSecure.get("/bookings?status=pending");
      return res.data;
    },
  });

  // Fetch all bookings
  const {
    data: allBookings = [],
    refetch: refetchAll,
    isLoading: loadingAll,
  } = useQuery({
    queryKey: ["allBookings"],
    queryFn: async () => {
      const res = await axiosSecure.get("/bookings");
      return res.data;
    },
  });

  if (loadingPending || loadingAll)
    return <p className="text-center mt-10">Loading bookings...</p>;

  // Approve booking
  const handleApprove = async (booking) => {
    try {
      const res = await axiosSecure.patch(`/bookings/${booking._id}`, {
        status: "approved",
      });
      if (res.data.success) {
        Swal.fire("Approved!", "Booking has been approved.", "success");
        refetchPending();
        refetchAll();
      }
    } catch (err) {
      Swal.fire("Error!", err.message || "Something went wrong", "error");
    }
  };

  // Reject booking
  const handleReject = async (id) => {
    try {
      const res = await axiosSecure.patch(`/bookings/${id}`, {
        status: "rejected",
      });
      if (res.data.success) {
        Swal.fire("Rejected!", "Booking has been rejected.", "error");
        refetchPending();
        refetchAll();
      }
    } catch (err) {
      Swal.fire("Error!", err.message || "Something went wrong", "error");
    }
  };

  // Update approved booking (example: change tutorEmail or sessionId if needed)
  const handleUpdate = async (booking) => {
    const { value: updates } = await Swal.fire({
      title: "Update Booking",
      html: `
        <input id="studentEmail" class="swal2-input" placeholder="Student Email" value="${booking.studentEmail}" />
        <input id="tutorEmail" class="swal2-input" placeholder="Tutor Email" value="${booking.tutorEmail}" />
        <input id="sessionId" class="swal2-input" placeholder="Session ID" value="${booking.sessionId}" />
      `,
      focusConfirm: false,
      preConfirm: () => {
        return {
          studentEmail: document.getElementById("studentEmail").value,
          tutorEmail: document.getElementById("tutorEmail").value,
          sessionId: document.getElementById("sessionId").value,
        };
      },
    });

    if (!updates) return;

    try {
      const res = await axiosSecure.patch(`/bookings/${booking._id}`, updates);
      if (res.data.success) {
        Swal.fire("Updated!", "Booking has been updated.", "success");
        refetchAll();
      }
    } catch (err) {
      Swal.fire("Error!", err.message || "Something went wrong", "error");
    }
  };

  // Delete booking
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the booking permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete!",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await axiosSecure.delete(`/bookings/${id}`);
        if (res.data.deletedCount > 0) {
          Swal.fire("Deleted!", "Booking has been deleted.", "success");
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
      {/* Pending Bookings Table */}
      <div>
        <h2 className="text-3xl font-bold mb-4">Pending Bookings</h2>
        {pendingBookings.length === 0 ? (
          <p className="text-center text-gray-500">No pending bookings.</p>
        ) : (
          <div className="overflow-x-auto rounded-t-3xl border-b-4 border-t border-r-2 border-l-2 border-indigo-600  shadow-lg shadow-indigo-300">
            <table className="table w-full table-auto bg-gradient-to-t from-indigo-100 via-purple-100 ">
              <thead className="bg-gray-100">
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Tutor</th>
                  <th>Session ID</th>
                  <th>Booked At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingBookings.map((booking, idx) => (
                  <tr key={booking._id}>
                    <td className="font-bold">{idx + 1}</td>
                    <td className="font-bold">{booking.studentEmail}</td>
                    <td>{booking.tutorEmail}</td>
                    <td>{booking.sessionId}</td>
                    <td>{new Date(booking.bookedAt).toLocaleString()}</td>
                    <td className="flex gap-2">
                      <button
                        onClick={() => handleApprove(booking)}
                        className="btn btn-success btn-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(booking._id)}
                        className="btn btn-error btn-sm"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* All Bookings Table */}
      <div>
        <h2 className="text-3xl font-bold mb-4">All Bookings</h2>
        {allBookings.length === 0 ? (
          <p className="text-center text-gray-500">No bookings available.</p>
        ) : (
          <div className="overflow-x-auto rounded-b-3xl border-t-4 border-b border-r-2 border-l-2 border-indigo-600  shadow-lg shadow-indigo-300">
            <table className="table w-full table-auto border bg-gradient-to-b from-indigo-200 via-purple-200">
              <thead className="bg-gray-100">
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Tutor</th>
                  <th>Session ID</th>
                  <th>Status</th>
                  <th>Booked At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allBookings.map((booking, idx) => (
                  <tr key={booking._id}>
                    <td className="font-bold">{idx + 1}</td>
                    <td className="font-bold">{booking.studentEmail}</td>
                    <td>{booking.tutorEmail}</td>
                    <td>{booking.sessionId}</td>
                    <td>
                      <span
                        className={`badge ${
                          booking.status === "approved"
                            ? "badge-success"
                            : booking.status === "rejected"
                            ? "badge-error"
                            : "badge-warning"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td>{new Date(booking.bookedAt).toLocaleString()}</td>
                    <td className="flex gap-2">
                      {booking.status === "approved" ? (
                        <>
                          <button
                            onClick={() => handleUpdate(booking)}
                            className="btn btn-primary btn-sm"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => handleDelete(booking._id)}
                            className="btn btn-error btn-sm"
                          >
                            Delete
                          </button>
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

export default ManageBookings;
