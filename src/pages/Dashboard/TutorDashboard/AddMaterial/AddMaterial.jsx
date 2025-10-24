
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../../Hooks/UseAuth";
import { motion } from "framer-motion";
import { Upload, FileText, Mail, Tag, Text, Loader2 } from "lucide-react";
import { useState } from "react";
import axios from "axios";

const AddMaterial = () => {
  const { user } = UseAuth();
  const axiosSecure = useAxiosSecure();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ImgBB upload function
  const uploadToImgBB = async (file) => {
    const formData = new FormData();
    formData.append("image", file);
    try {
      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
        formData
      );
      return response.data.data.url;
    } catch (error) {
      throw new Error("Failed to upload file to ImgBB");
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Upload file to ImgBB
      let imageUrl = null;
      if (data.file && data.file[0]) {
        imageUrl = await uploadToImgBB(data.file[0]);
      }

      // Prepare JSON data for backend
      const materialData = {
        sessionId: data.sessionId,
        title: data.title,
        description: data.description,
        tutorEmail: user?.email || "",
        imageUrl: imageUrl || "no-file",
      };

      const res = await axiosSecure.post("/materials", materialData);
      if (res.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Material uploaded (waiting for admin approval)",
          customClass: { confirmButton: "btn btn-success bg-gradient-to-r from-green-500 to-emerald-600 text-white" },
          timer: 2000,
        });
        reset();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Upload failed. Try again.",
          customClass: { confirmButton: "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white" },
        });
      }
    } catch (error) {
      console.error("❌ Error uploading material:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.message || "Failed to upload material",
        customClass: { confirmButton: "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-xl mx-auto">
        {/* === HEADER === */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="text-center relative mb-8"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-20 rounded-2xl"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            Upload Study Material
          </h2>
          <p className="text-lg text-gray-600 mt-2">Share resources for your study sessions</p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full"
          />
        </motion.div>

        {/* === FORM === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg p-6 md:p-8 border border-indigo-100"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Session ID */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Tag className="w-4 h-4 text-indigo-600" /> Session ID
              </label>
              <input
                {...register("sessionId", { required: "Session ID is required" })}
                className={`w-full input input-bordered bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 ${errors.sessionId ? "border-red-500" : ""}`}
                placeholder="Enter Session ID"
              />
              {errors.sessionId && (
                <p className="text-red-500 text-xs mt-1">{errors.sessionId.message}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <FileText className="w-4 h-4 text-indigo-600" /> Title
              </label>
              <input
                {...register("title", { required: "Title is required" })}
                className={`w-full input input-bordered bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 ${errors.title ? "border-red-500" : ""}`}
                placeholder="Enter Material Title"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Text className="w-4 h-4 text-indigo-600" /> Description
              </label>
              <textarea
                {...register("description")}
                className="w-full textarea textarea-bordered bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                placeholder="Enter Description (Optional)"
                rows="4"
              />
            </div>

            {/* Tutor Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Mail className="w-4 h-4 text-indigo-600" /> Tutor Email
              </label>
              <input
                type="email"
                value={user?.email || "No email available"}
                readOnly
                className="w-full input input-bordered bg-gray-100 cursor-not-allowed text-gray-600"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                <Upload className="w-4 h-4 text-indigo-600" /> Upload File
              </label>
              <input
                type="file"
                {...register("file", { required: "File is required" })}
                accept=".pdf,image/*"
                className={`file-input file-input-bordered w-full bg-white ${errors.file ? "border-red-500" : ""}`}
              />
              {errors.file && (
                <p className="text-red-500 text-xs mt-1">{errors.file.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`btn w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg flex items-center justify-center gap-2 ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Upload Material
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddMaterial;
