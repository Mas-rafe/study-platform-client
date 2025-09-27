
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import { useParams } from "react-router";

const StudentBookedSessionDetails = () => {
  const { id } = useParams(); // booking/session id
  const axiosSecure = useAxiosSecure();

  // Fetch session details
  const { data: session = {}, isLoading: sessionLoading } = useQuery({
    queryKey: ["sessionDetails", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/sessions/${id}`);
      return res.data;
    },
  });

  // Fetch session materials
  const { data: materials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ["sessionMaterials", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/materials/session/${id}`);
      return res.data;
    },
  });

  if (sessionLoading || materialsLoading) return <p>Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Session Info */}
      <div className="p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold">{session.title}</h2>
        <p><strong>Tutor:</strong> {session.tutorName}</p>
        <p><strong>Fee:</strong> ${session.fee}</p>
        <p><strong>Schedule:</strong> {session.startDate} → {session.endDate}</p>
        <p className="mt-2">{session.description}</p>
      </div>

      {/* Study Materials */}
      <div className="p-6 bg-white rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-3">Study Materials</h3>
        {materials.length === 0 ? (
          <p>No materials uploaded yet for this session.</p>
        ) : (
          <ul className="space-y-4">
            {materials.map((mat) => (
              <li
                key={mat._id}
                className="p-4 border rounded-lg shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4"
              >
                <img
                  src={mat.image}
                  alt="Material"
                  className="w-32 h-32 object-cover rounded-md border"
                />
                <div className="flex-1">
                  <p className="font-medium">{mat.title}</p>
                  <a
                    href={mat.driveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    Open Google Drive Link
                  </a>
                </div>
                <a
                  href={mat.image}
                  download
                  className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Download
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudentBookedSessionDetails;
