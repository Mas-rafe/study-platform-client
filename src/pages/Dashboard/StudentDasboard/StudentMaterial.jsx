import { useQuery } from "@tanstack/react-query";

import { useState } from "react";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";

const StudentMaterials = () => {
  const axiosSecure = useAxiosSecure();
  const [selectedMaterial, setSelectedMaterial] = useState(null);

  const { data: materials = [], isLoading, error } = useQuery({
    queryKey: ["approvedMaterials"],
    queryFn: async () => {
      const res = await axiosSecure.get("/materials/approved");
      return res.data;
    },
  });

  if (isLoading) return <p className="text-center py-10">Loading materials...</p>;
  if (error) return <p className="text-center py-10 text-red-500">Failed to load materials</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Approved Study Materials</h2>
      {materials.length === 0 ? (
        <p className="text-gray-500">No approved materials available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materials.map((material) => (
            <div
              key={material._id}
              className="p-4 border rounded-lg shadow-md bg-white flex flex-col justify-between"
            >
              <h3 className="font-bold text-lg">{material.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{material.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                Uploaded by: {material.tutorEmail}
              </p>
              <button
                onClick={() => setSelectedMaterial(material)}
                className="mt-3 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedMaterial && (
        <dialog id="materialModal" open className="modal">
          <div className="modal-box w-11/12 max-w-3xl">
            <h3 className="font-bold text-lg">{selectedMaterial.title}</h3>
            <p className="py-2">{selectedMaterial.description}</p>
            <iframe
              src={selectedMaterial.fileUrl}
              title="Material PDF"
              className="w-full h-[500px] border"
            ></iframe>
            <div className="modal-action">
              <button
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
                onClick={() => setSelectedMaterial(null)}
              >
                Close
              </button>
              <a
                href={selectedMaterial.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
              >
                Download
              </a>
            </div>
          </div>
        </dialog>
      )}
    </div>
  );
};

export default StudentMaterials;
