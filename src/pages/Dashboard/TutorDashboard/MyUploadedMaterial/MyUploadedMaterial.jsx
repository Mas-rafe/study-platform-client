
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../../Hooks/UseAuth";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Link, Image, Trash2, Edit, AlertCircle, Loader2, Tag } from "lucide-react";
import { useState } from "react";

const MyUploadedMaterials = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = UseAuth();
  const [expanded, setExpanded] = useState(null); // Track expanded accordion

  // Fetch tutor materials
  const { data: materials = [], refetch, isLoading, error } = useQuery({
    queryKey: ["tutorMaterials", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const res = await axiosSecure.get(`/materials/tutor/${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  // Delete material
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This material will be deleted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      customClass: { confirmButton: "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white" },
    });

    if (confirm.isConfirmed) {
      try {
        await axiosSecure.delete(`/materials/${id}`);
        Swal.fire({
          title: "Deleted!",
          text: "Material deleted successfully.",
          icon: "success",
          customClass: { confirmButton: "btn btn-success bg-gradient-to-r from-green-500 to-emerald-600 text-white" },
          timer: 2000,
        });
        refetch();
      } catch (err) {
        Swal.fire({
          title: "Error!",
          text: err.response?.data?.message || err.message,
          icon: "error",
          customClass: { confirmButton: "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white" },
        });
      }
    }
  };

  // Toggle accordion
  const toggleAccordion = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-16 h-16 text-indigo-600" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 text-red-500 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <AlertCircle className="w-16 h-16 mx-auto mb-4" />
        <p>Error loading materials: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* === HEADER === */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="text-center relative"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-20 rounded-2xl"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            My Uploaded Materials
          </h2>
          <p className="text-lg text-gray-600 mt-2">View and manage your uploaded resources</p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full"
          />
        </motion.div>

        {/* === TIMELINE === */}
        {materials.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center py-16 bg-white rounded-2xl shadow-lg"
          >
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">You have not uploaded any materials yet.</p>
          </motion.div>
        ) : (
          <div className="relative">
            {/* Timeline Vertical Line */}
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500"></div>

            {materials.map((material, idx) => (
              <motion.div
                key={material._id}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`relative mb-8 ${idx % 2 === 0 ? "md:pr-12" : "md:pl-12"}`}
              >
                {/* Timeline Dot */}
                <div className="absolute left-4 md:left-[calc(50%-0.5rem)] top-4 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white"></div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg p-4 ml-12 md:ml-0 border border-indigo-100"
                >
                  {/* Accordion Header */}
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleAccordion(material._id)}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-semibold text-lg text-gray-800 truncate" title={material.title || "Untitled"}>
                        {material.title || "Untitled"}
                      </h3>
                    </div>
                    <motion.div
                      animate={{ rotate: expanded === material._id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </motion.div>
                  </div>

                  {/* Accordion Content */}
                  <AnimatePresence>
                    {expanded === material._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 space-y-3"
                      >
                        <p className="text-gray-600 flex items-center gap-2">
                          <Tag className="w-4 h-4" /> Session ID: {material.sessionId || "N/A"}
                        </p>
                        <p className="text-gray-600 flex items-center gap-2">
                          <Link className="w-4 h-4" />
                          Link:{" "}
                          {material.fileUrl ? (
                            <a
                              href={material.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-500 underline truncate"
                            >
                              {material.fileUrl}
                            </a>
                          ) : (
                            "No link available"
                          )}
                        </p>
                        {material.image && (
                          <img
                            src={material.image}
                            alt={material.title || "Untitled"}
                            className="mt-2 w-full h-40 rounded-md object-cover"
                          />
                        )}
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(material._id)}
                            className="btn btn-sm bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </motion.button>
                          {/* Optional Update Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn btn-sm bg-gradient-to-r from-yellow-400 to-amber-500 text-white rounded-lg flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" /> Update
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyUploadedMaterials;