
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import { useParams } from "react-router";

const StudentBookedSessionMaterials = () => {
  const { id } = useParams(); // sessionId
  const axiosSecure = useAxiosSecure();

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ["sessionMaterials", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/materials/session/${id}`);
      return res.data;
    },
  });

  if (isLoading) return <p className="p-4">Loading materials...</p>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Study Materials</h2>

      {materials.length === 0 ? (
        <p>No materials uploaded yet for this session.</p>
      ) : (
        <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((mat) => (
            <li
              key={mat._id}
              className="p-4 border rounded-xl shadow-sm bg-white flex flex-col gap-3"
            >
              <img
                src={mat.image}
                alt="Material"
                className="w-full h-40 object-cover rounded-md border"
              />
              <p className="font-semibold">{mat.title}</p>

              {/* Open Google Drive */}
              <a
                href={mat.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Open in Google Drive
              </a>

              {/* Download image */}
              <a
                href={mat.image}
                download
                className="px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 text-center"
              >
                Download Image
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentBookedSessionMaterials;
