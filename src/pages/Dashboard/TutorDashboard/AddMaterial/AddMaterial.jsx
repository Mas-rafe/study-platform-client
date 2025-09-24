import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../../Hooks/UseAuth";

const AddMaterial = () => {
  const { user } = UseAuth();
  const axiosSecure = useAxiosSecure();
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      const formData = new FormData();
      formData.append("sessionId", data.sessionId);
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("tutorEmail", user?.email || ""); // ✅ send tutor email
      formData.append("file", data.file[0]); // only first file

      const res = await axiosSecure.post("/materials", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.success) {
        Swal.fire("✅ Success", "Material uploaded (waiting for admin approval)", "success");
        reset();
      } else {
        Swal.fire("⚠️ Error", "Upload failed. Try again.", "error");
      }
    } catch (error) {
      console.error("❌ Error uploading material:", error);
      Swal.fire("❌ Error", "Failed to upload material", "error");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded-xl">
      <h2 className="text-2xl font-bold mb-4">Upload Study Material</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Session ID */}
        <div>
          <label className="block font-medium">Session ID</label>
          <input
            {...register("sessionId", { required: true })}
            className="w-full input input-bordered"
            placeholder="Enter Session ID"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block font-medium">Title</label>
          <input
            {...register("title", { required: true })}
            className="w-full input input-bordered"
            placeholder="Enter Material Title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block font-medium">Description</label>
          <textarea
            {...register("description")}
            className="w-full textarea textarea-bordered"
            placeholder="Enter Description"
          />
        </div>

        {/* Tutor Email (readonly but included in payload) */}
        <div>
          <label className="block font-medium">Tutor Email</label>
          <input
            type="email"
            value={user?.email || ""}
            readOnly
            className="w-full input input-bordered bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block font-medium">Upload File</label>
          <input
            type="file"
            {...register("file", { required: true })}
            className="file-input file-input-bordered w-full"
          />
        </div>

        <button type="submit" className="btn btn-primary w-full">
          Upload Material
        </button>
      </form>
    </div>
  );
};

export default AddMaterial;
