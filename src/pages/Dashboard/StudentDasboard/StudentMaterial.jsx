
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Download, Eye, Loader2, AlertCircle, Image as ImageIcon, Filter } from "lucide-react";
import Swal from "sweetalert2";

const StudentMaterials = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = UseAuth();
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [filterSessionId, setFilterSessionId] = useState("");

  // Default placeholder image
  const placeholderImage = "https://via.placeholder.com/150?text=No+Image";

  // Fetch booked sessions for filtering
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["myBookings", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const res = await axiosSecure.get(`/bookings/student/${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  // Fetch approved materials
  const { data: materials = [], isLoading, error } = useQuery({
    queryKey: ["approvedMaterials", user?.email, filterSessionId],
    queryFn: async () => {
      if (!user?.email) return [];
      const res = await axiosSecure.get(`/materials/approved?email=${user.email}`);
      return filterSessionId
        ? res.data.filter((material) => material.sessionId === filterSessionId)
        : res.data;
    },
    enabled: !!user?.email,
  });

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Handle modal open
  const handleViewMaterial = (material) => {
    setSelectedMaterial(material);
  };

  // Loading state
  if (bookingsLoading || isLoading) {
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

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
          <p className="text-red-500">Failed to load materials: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* === HEADER === */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="relative"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-20 rounded-2xl"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            📚 Study Materials
          </h2>
          <p className="text-lg text-gray-600 mt-2">Access approved materials for your booked sessions</p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full"
          />
        </motion.header>

        {/* === FILTER === */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Filter className="w-6 h-6 text-indigo-600" /> Filter Materials by Session
          </h3>
          <select
            value={filterSessionId}
            onChange={(e) => setFilterSessionId(e.target.value)}
            className="select select-bordered w-full bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
          >
            <option value="">All Sessions</option>
            {bookings.map((b) => (
              <option key={b.sessionId || b.session?._id} value={b.sessionId || b.session?._id}>
                {b.session?.title || "Untitled Session"}
              </option>
            ))}
          </select>
        </motion.section>

        {/* === MATERIALS LIST === */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" /> Approved Materials
          </h3>
          {materials.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No approved materials available yet.</p>
            </div>
          ) : (
            <div className="relative space-y-6">
              {/* Timeline Line */}
              <div className="absolute left-4 md:left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
              {materials.map((material, idx) => (
                <motion.div
                  key={material._id || `material-${idx}`}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative pl-12"
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-2 md:left-4 top-4 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white"></div>
                  <div className="bg-white rounded-lg shadow-md p-4 border border-indigo-100">
                    <div className="flex items-center gap-4">
                      {/* Material or Session Image */}
                      {material.image || material.session?.image ? (
                        <img
                          src={material.image || material.session.image}
                          alt={material.title || "Material"}
                          className="w-16 h-16 rounded-md object-cover"
                          onError={(e) => (e.target.src = placeholderImage)}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{material.title || "Untitled Material"}</div>
                        <div className="text-sm text-gray-600">{material.session?.title || "No Session Linked"}</div>
                        <div className="text-sm text-gray-500 mt-1">Uploaded by: {material.tutorEmail || "N/A"}</div>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewMaterial(material)}
                          className="btn btn-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" /> View
                        </motion.button>
                        <a
                          href={material.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" /> Download
                        </a>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">{material.description || "No description"}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* === MODAL === */}
        <AnimatePresence>
          {selectedMaterial && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg p-6 w-11/12 max-w-3xl"
              >
                <h3 className="font-bold text-lg text-gray-800">{selectedMaterial.title || "Untitled Material"}</h3>
                <p className="text-sm text-gray-600 mt-2">{selectedMaterial.description || "No description"}</p>
                <p className="text-sm text-gray-500 mt-1">Session: {selectedMaterial.session?.title || "N/A"}</p>
                <p className="text-sm text-gray-500 mt-1">Uploaded by: {selectedMaterial.tutorEmail || "N/A"}</p>
                {selectedMaterial.fileUrl && (
                  <iframe
                    src={selectedMaterial.fileUrl}
                    title="Material Preview"
                    className="w-full h-[500px] border mt-4"
                  ></iframe>
                )}
                <div className="flex gap-2 mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedMaterial(null)}
                    className="btn btn-sm bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg flex items-center gap-1"
                  >
                    Close
                  </motion.button>
                  <a
                    href={selectedMaterial.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" /> Download
                  </a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentMaterials;
