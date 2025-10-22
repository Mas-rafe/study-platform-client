import { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Swal from "sweetalert2";
import { motion } from "framer-motion";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";

// Zod Schema
const sessionSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  subject: z.string().min(2, "Short subject"),
  description: z.string().min(20, "Description too short"),
  registrationStart: z.string().min(1, "Required"),
  registrationEnd: z.string().min(1, "Required"),
  classStart: z.string().min(1, "Required"),
  classStartTime: z.string().min(1, "Required"),
  classEnd: z.string().min(1, "Required"),
  duration: z.coerce.number().min(1, "Duration ≥ 1 hour"),
  registrationFee: z.coerce.number().min(0, "Fee ≥ 0"),
  image: z.any(), // File object
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

  // Upload to ImgBB
  const uploadToImgBB = async (file) => {
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    if (!apiKey) throw new Error("Add VITE_IMGBB_API_KEY to .env");

    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      console.log("Uploading:", file.name);
      const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error?.message || "Upload failed");
      }

      console.log("Uploaded:", result.data.url);
      setUploading(false);
      return result.data.url;
    } catch (err) {
      console.error("Upload failed:", err);
      setUploading(false);
      throw err;
    }
  };

  const onSubmit = async (data) => {
    try {
      console.log("=== FORM DATA ===");
      console.log("data.image:", data.image);

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

      console.log("Sending to /sessions:", sessionData);

      // SEND AS JSON — NOT FormData
      const res = await fetch("https://study-platform-server-ruddy.vercel.app/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sessionData),
      });

      const result = await res.json();

      if (result.success && result.insertedId) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Session created!",
          timer: 2000,
        });
        reset();
        setImagePreview(null);
        imageInputRef.current.value = null;
      } else {
        throw new Error(result.message || "Failed to create session");
      }
    } catch (err) {
      console.error("Error:", err);
      Swal.fire("Error", err.message || "Something went wrong", "error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto p-6 bg-white rounded-xl shadow-lg"
    >
      <h2 className="text-3xl font-bold text-center mb-8 text-primary">
        Create Study Session
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* IMAGE UPLOAD */}
        <motion.div className="flex flex-col items-center">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Image
          </label>
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                setValue("image", e.target.files); // For react-hook-form
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
            className="cursor-pointer flex flex-col items-center justify-center w-64 h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition-colors"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 48 48"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l16-12 16 12v20a4 4 0 01-4 4H8a4 4 0 01-4-4V16z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 32l4-8 4 8m-8 4h8"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">Click to upload</p>
              </div>
            )}
          </label>
          {uploading && (
            <p className="mt-2 text-sm text-blue-600 animate-pulse">
              Uploading...
            </p>
          )}
          {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image.message}</p>}
        </motion.div>

        {/* Title & Subject */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label font-semibold">Session Title</label>
            <input
              {...register("title")}
              placeholder="e.g. Advanced React"
              className="input input-bordered w-full"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>
          <div>
            <label className="label font-semibold">Subject</label>
            <input
              {...register("subject")}
              placeholder="e.g. Web Dev"
              className="input input-bordered w-full"
            />
            {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="label font-semibold">Description</label>
          <textarea
            {...register("description")}
            rows={4}
            placeholder="What will students learn?"
            className="textarea textarea-bordered w-full"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        {/* Schedule */}
        <div>
          <h3 className="font-semibold mb-3 text-lg">Schedule</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label text-sm">Registration Start</label>
              <input type="date" {...register("registrationStart")} className="input input-bordered w-full" />
              {errors.registrationStart && <p className="text-red-500 text-sm mt-1">{errors.registrationStart.message}</p>}
            </div>
            <div>
              <label className="label text-sm">Registration End</label>
              <input type="date" {...register("registrationEnd")} className="input input-bordered w-full" />
              {errors.registrationEnd && <p className="text-red-500 text-sm mt-1">{errors.registrationEnd.message}</p>}
            </div>
            <div>
              <label className="label text-sm">Class Start Date</label>
              <input type="date" {...register("classStart")} className="input input-bordered w-full" />
              {errors.classStart && <p className="text-red-500 text-sm mt-1">{errors.classStart.message}</p>}
            </div>
            <div>
              <label className="label text-sm">Class Start Time</label>
              <input type="time" {...register("classStartTime")} className="input input-bordered w-full" />
              {errors.classStartTime && <p className="text-red-500 text-sm mt-1">{errors.classStartTime.message}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="label text-sm">Class End Date</label>
              <input type="date" {...register("classEnd")} className="input input-bordered w-full" />
              {errors.classEnd && <p className="text-red-500 text-sm mt-1">{errors.classEnd.message}</p>}
            </div>
          </div>
        </div>

        {/* Duration & Fee */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label font-semibold">Duration (hours)</label>
            <input
              type="number"
              {...register("duration", { valueAsNumber: true })}
              placeholder="2"
              className="input input-bordered w-full"
            />
            {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>}
          </div>
          <div>
            <label className="label font-semibold">Registration Fee ($)</label>
            <input
              type="number"
              {...register("registrationFee", { valueAsNumber: true })}
              placeholder="0 = Free"
              className="input input-bordered w-full"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || uploading}
          className="btn btn-primary w-full mt-6"
        >
          {isSubmitting || uploading ? "Creating..." : "Create Session"}
        </button>
      </form>
    </motion.div>
  );
};

export default StudySessionsForm;