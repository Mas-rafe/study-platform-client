import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import axios from "axios";
import { motion } from "framer-motion";
import { Camera, Mail, User, School, BookOpen } from "lucide-react";
import UseAuth from "../../../Hooks/UseAuth";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";

const StudentProfile = () => {
  const { user } = UseAuth();
  const axiosSecure = useAxiosSecure();
  const [uploading, setUploading] = useState(false);

  // Fetch profile from DB
  const {
    data: profile = {},
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["studentProfile", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/profile/${user.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  // Image upload handler
  const handlePhotoChange = async (e) => {
    const image = e.target.files[0];
    if (!image) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("image", image);

    try {
      // 1️⃣ Upload to ImgBB
      const res = await axios.post(
        `https://api.imgbb.com/1/upload?key=YOUR_IMGBB_KEY`,
        formData
      );

      const photoURL = res.data.data.url;

      // 2️⃣ Update DB
      await axiosSecure.patch("/users/update-photo", {
        email: user.email,
        photoURL,
      });

      Swal.fire({
        icon: "success",
        title: "Updated",
        text: "Profile picture updated successfully",
      });

      refetch();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Upload Failed",
        text: "Could not update profile picture",
      });
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <img
              src={profile.photoURL || user?.photoURL || "/default-avatar.png"}
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500"
            />
            <label className="absolute bottom-2 right-2 bg-indigo-600 p-2 rounded-full cursor-pointer">
              <Camera className="w-4 h-4 text-white" />
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Basic Info */}
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-600" />
              {profile.name || user?.displayName || "Student"}
            </h2>
            <p className="text-gray-600 flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4" /> {user?.email}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="divider my-6"></div>

        {/* Academic Info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <School className="w-5 h-5 text-indigo-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Institution</p>
              <p className="font-medium">
                {profile.institution || "Not added yet"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-indigo-600 mt-1" />
            <div>
              <p className="text-sm text-gray-500">Department</p>
              <p className="font-medium">
                {profile.department || "Not added yet"}
              </p>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-1">Bio</p>
          <p className="text-gray-700">
            {profile.bio || "No bio added yet."}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentProfile;
