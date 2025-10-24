import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";
import { Upload, Calendar, Clock, DollarSign, BookOpen, FileText, AlertCircle } from "lucide-react";

// Zod Schema
const sessionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  subject: z.string().min(2, "Subject is too short"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  registrationStart: z.string().min(1, "Registration start date is required"),
  registrationEnd: z.string().min(1, "Registration end date is required"),
  classStart: z.string().min(1, "Class start date is required"),
  classStartTime: z.string().min(1, "Class start time is required"),
  classEnd: z.string().min(1, "Class end date is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 hour"),
  registrationFee: z.coerce.number().min(0, "Fee cannot be negative"),
  image: z.any().refine((files) => files?.length > 0, "Image is required"),
});

const StudySessionsForm = () => {
  const { user } = UseAuth();
  const axiosSecure = useAxiosSecure();
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const imageInputRef = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(sessionSchema),
    defaultValues: { registrationFee: 0 },
  });

  const uploadToImgBB = async (file) => {
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey) throw new Error("Add VITE_IMGBB_API_KEY to .env");

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || "Image upload failed");
      }

      setUploading(false);
      return result.data.url;
    } catch (err) {
      setUploading(false);
      throw err;
    }
  };

  const onSubmit = async (data) => {
    try {
      let imageUrl = null;
      if (data.image && data.image[0]) {
        imageUrl = await uploadToImgBB(data.image[0]);
      }

      const sessionData = {
        title: data.title,
        subject: data.subject,
        description: data.description,
        image: imageUrl,
        registrationStart: new Date(data.registrationStart).toISOString(),
        registrationEnd: new Date(data.registrationEnd).toISOString(),
        classStart: new Date(`${data.classStart}T${data.classStartTime}`).toISOString(),
        classEnd: new Date(data.classEnd).toISOString(),
        duration: Number(data.duration),
        registrationFee: Number(data.registrationFee),
        tutorName: user?.displayName || "Unknown",
        tutorEmail: user?.email || "unknown@example.com",
      };

      const res = await axiosSecure.post("/sessions", sessionData);

      if (res.data.success && res.data.insertedId) {
        Swal.fire({
          icon: "success",
          title: "Session Created!",
          text: "Your study session is now pending approval.",
          timer: 2000,
          customClass: { confirmButton: "btn btn-success" },
        });
        reset();
        setImagePreview(null);
        imageInputRef.current.value = null;
      } else {
        throw new Error(res.data.message || "Failed to create session");
      }
    } catch (err) {
      console.error("Error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Something went wrong",
        customClass: { confirmButton: "btn btn-error" },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-10"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center relative mb-8"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-20 rounded-2xl"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Create a New Study Session
          </h2>
          <p className="text-gray-600 mt-2 text-lg">Engage your students with a new learning experience</p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full"
          />
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Image Upload */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-center"
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Session Image
            </label>
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setValue("image", e.target.files);
                  const reader = new FileReader();
                  reader.onloadend = () => setImagePreview(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="cursor-pointer flex flex-col items-center justify-center w-80 h-48 border-2 border-dashed border-indigo-200 rounded-xl hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300"
            >
              {imagePreview ? (
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-indigo-400" />
                  <p className="mt-2 text-sm text-gray-600">Upload a session image</p>
                </div>
              )}
            </label>
            {uploading && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-2 text-sm text-indigo-600 animate-pulse flex items-center gap-2"
              >
                <Upload className="w-4 h-4" /> Uploading...
              </motion.p>
            )}
            {errors.image && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.image.message}
              </p>
            )}
          </motion.div>

          {/* Title & Subject */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" /> Session Title
              </label>
              <input
                {...register("title")}
                placeholder="e.g. Advanced React for Beginners"
                className="input w-full rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.title.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Subject
              </label>
              <input
                {...register("subject")}
                placeholder="e.g. Web Development"
                className="input w-full rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
              />
              {errors.subject && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.subject.message}
                </p>
              )}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Description
            </label>
            <textarea
              {...register("description")}
              rows={5}
              placeholder="Describe what students will learn in this session..."
              className="textarea w-full rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" /> {errors.description.message}
              </p>
            )}
          </motion.div>

          {/* Schedule */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" /> Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Registration Start
                </label>
                <input
                  type="date"
                  {...register("registrationStart")}
                  className="input w-full rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                />
                {errors.registrationStart && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.registrationStart.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Registration End
                </label>
                <input
                  type="date"
                  {...register("registrationEnd")}
                  className="input w-full rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                />
                {errors.registrationEnd && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.registrationEnd.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Class Start Date
                </label>
                <input
                  type="date"
                  {...register("classStart")}
                  className="input w-full rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                />
                {errors.classStart && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.classStart.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Class Start Time
                </label>
                <input
                  type="time"
                  {...register("classStartTime")}
                  className="input w-full rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                />
                {errors.classStartTime && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.classStartTime.message}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Class End Date
                </label>
                <input
                  type="date"
                  {...register("classEnd")}
                  className="input w-full rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                />
                {errors.classEnd && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.classEnd.message}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Duration & Fee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" /> Duration (hours)
              </label>
              <input
                type="number"
                {...register("duration", { valueAsNumber: true })}
                placeholder="e.g. 2"
                className="input w-full rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
              />
              {errors.duration && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.duration.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Registration Fee ($)
              </label>
              <input
                type="number"
                {...register("registrationFee", { valueAsNumber: true })}
                placeholder="e.g. 0 (Free)"
                className="input w-full rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 transition-all"
              />
              {errors.registrationFee && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {errors.registrationFee.message}
                </p>
              )}
            </div>
          </motion.div>

          {/* Submit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <button
              type="submit"
              disabled={isSubmitting || uploading}
              className={`btn w-full rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 ${
                isSubmitting || uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting || uploading ? (
                <span className="flex items-center gap-2">
                  <span className="loading loading-spinner"></span> Creating...
                </span>
              ) : (
                "Create Session"
              )}
            </button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default StudySessionsForm;