import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../../Hooks/UseAuth";

const MyUploadedMaterials = () => {
  const axiosSecure = useAxiosSecure();
  const { user, email } = UseAuth();

  // ✅ Fetch tutor materials (React Query v5 object syntax)
  const { data: materials = [], refetch } = useQuery({
    queryKey: ["tutorMaterials", email],
    queryFn: async () => {
      if (!email) return [];
      const res = await axiosSecure.get(`/materials/tutor/${email}`);
      return res.data;
    },
    enabled: !!email, // Only run if email exists
  });

  // Delete material
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This material will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axiosSecure.delete(`/materials/${id}`);
        Swal.fire("Deleted!", "Material deleted successfully.", "success");
        refetch();
      } catch (err) {
        Swal.fire("Error!", err.response?.data?.message || err.message, "error");
      }
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">My Uploaded Materials</h2>

      {materials.length === 0 ? (
        <p className="text-gray-500">You have not uploaded any materials yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {materials.map((m) => (
            <div key={m._id} className="bg-white p-4 rounded-2xl shadow-md">
              <h3 className="font-semibold text-lg">{m.title}</h3>
              <p className="text-gray-600">Session ID: {m.sessionId}</p>
              <p className="text-gray-600">
                Link:{" "}
                <a
                  href={m.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline"
                >
                  {m.link}
                </a>
              </p>
              {m.image && (
                <img
                  src={m.image}
                  alt={m.title}
                  className="mt-2 w-full rounded-md object-cover"
                />
              )}
              <div className="mt-4 flex gap-2">
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => handleDelete(m._id)}
                >
                  Delete
                </button>
                {/* Optional: Add update button here */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyUploadedMaterials;
