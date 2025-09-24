import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import UseAuth from "../../../../Hooks/UseAuth";
import useAxiosSecure from "../../../../Hooks/UseAxiosSecure";


const MySessions = () => {
  const { user } = UseAuth();
  const axiosSecure = useAxiosSecure();

  // Fetch tutor sessions
  const { data: sessions = [], refetch, isLoading } = useQuery({
    queryKey: ["tutor-sessions", user?.email],
    queryFn: async () => {
      const { data } = await axiosSecure.get(`/sessions/tutor/${user?.email}`);
      return data;
    },
    enabled: !!user?.email,
  });

  // Resubmit a rejected session
  const handleResubmit = async (id) => {
    try {
      const { data } = await axiosSecure.patch(`/sessions/${id}/resubmit`);
      if (data.modifiedCount > 0) {
        Swal.fire("Resubmitted!", "Your session is pending approval again.", "success");
        refetch();
      }
    } catch (error) {
      Swal.fire("Error!", "Failed to resubmit session.", "error");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-10">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        My Study Sessions
      </h2>

      {sessions.length === 0 ? (
        <p className="text-center text-gray-500">No sessions found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full border rounded-xl shadow-md">
            <thead className="bg-base-200 text-sm text-gray-700">
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Status</th>
                <th>Reg. Fee</th>
                <th>Duration</th>
                <th>Dates</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session, idx) => (
                <tr key={session._id} className="hover">
                  <td>{idx + 1}</td>
                  <td className="font-medium">{session.title}</td>
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
                    {session.registrationFee > 0
                      ? `$${session.registrationFee}`
                      : "Free"}
                  </td>
                  <td>{session.sessionDuration} hrs</td>
                  <td>
                    <div className="text-xs">
                      <p>Reg: {session.registrationStartDate} → {session.registrationEndDate}</p>
                      <p>Class: {session.classStartDate} → {session.classEndDate}</p>
                    </div>
                  </td>
                  <td>
                    {session.status === "rejected" ? (
                      <button
                        onClick={() => handleResubmit(session._id)}
                        className="btn btn-xs btn-outline btn-warning"
                      >
                        Resubmit
                      </button>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
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

export default MySessions;
