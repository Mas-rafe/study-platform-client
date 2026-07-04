import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Download,
  Eye,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Filter,
  Search,
  BookOpen,
  FolderOpen,
  ExternalLink,
  X,
  User,
  Sparkles,
  Layers,
  Calendar,
  CheckCircle,
} from "lucide-react";

const placeholderImage = "https://via.placeholder.com/600x300?text=No+Image";

const normalizeId = (id) => {
  return id ? String(id) : "";
};

const getBookingSessionId = (booking) => {
  return normalizeId(booking.sessionId || booking.session?._id);
};

const getMaterialSessionId = (material) => {
  return normalizeId(material.sessionId || material.session?._id);
};

const getMaterialImage = (material) => {
  return material.imageUrl || material.image || material.session?.image || "";
};

const getMaterialLink = (material) => {
  return (
    material.fileUrl ||
    material.driveLink ||
    material.imageUrl ||
    material.image ||
    ""
  );
};

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

const StatCard = ({ icon: Icon, label, value, gradient = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className={
        gradient
          ? "rounded-3xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg p-6"
          : "rounded-3xl bg-base-100 border border-base-300 text-base-content shadow-lg p-6"
      }
    >
      <Icon
        className={
          gradient ? "w-8 h-8 mb-3" : "w-8 h-8 text-indigo-600 mb-3"
        }
      />

      <p
        className={
          gradient ? "text-sm text-white/70" : "text-sm text-base-content/50"
        }
      >
        {label}
      </p>

      <h3 className="text-3xl font-bold mt-1">{value}</h3>
    </motion.div>
  );
};

const EmptyState = ({ title, text }) => {
  return (
    <div className="text-center py-14 bg-base-200 border border-base-300 rounded-3xl">
      <AlertCircle className="w-12 h-12 text-base-content/40 mx-auto mb-3" />
      <h4 className="font-bold text-lg text-base-content">{title}</h4>
      <p className="text-base-content/60 mt-1">{text}</p>
    </div>
  );
};

const BookedSessionMaterialFinder = ({
  bookings,
  materials,
  selectedSessionId,
  onSelectSession,
}) => {
  const getMaterialCountForSession = (sessionId) => {
    return materials.filter(
      (material) => getMaterialSessionId(material) === normalizeId(sessionId)
    ).length;
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-6 md:p-8"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h3 className="text-2xl font-bold text-base-content flex items-center gap-2">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Materials by Your Booked Sessions
          </h3>

          <p className="text-base-content/60 mt-1">
            Choose a booked session to see only the materials available for that
            session.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onSelectSession("")}
          className={`btn btn-sm ${
            selectedSessionId === "" ? "btn-primary" : "btn-outline"
          }`}
        >
          Show All Materials
        </button>
      </div>

      {bookings.length === 0 ? (
        <EmptyState
          title="No booked sessions"
          text="After booking a session, you will see session-wise materials here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {bookings.map((booking, index) => {
            const sessionId = getBookingSessionId(booking);
            const count = getMaterialCountForSession(sessionId);
            const isSelected = selectedSessionId === sessionId;

            return (
              <motion.button
                type="button"
                key={sessionId || `booking-${index}`}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectSession(sessionId)}
                className={`text-left rounded-3xl border overflow-hidden transition-all ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500/10 shadow-xl ring-2 ring-indigo-500/30"
                    : "border-base-300 bg-base-200 hover:bg-base-300 shadow-md"
                }`}
              >
                <div className="h-36 bg-base-300 overflow-hidden">
                  {booking.session?.image ? (
                    <img
                      src={booking.session.image}
                      alt={booking.session?.title || "Session"}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = placeholderImage;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-base-content/40">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-lg text-base-content line-clamp-1">
                        {booking.session?.title || "Untitled Session"}
                      </h4>

                      <p className="text-sm text-base-content/60 mt-1 line-clamp-2">
                        {booking.session?.description ||
                          "No description available."}
                      </p>
                    </div>

                    {isSelected && (
                      <span className="badge badge-primary badge-sm">
                        Selected
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-base-content/50 mt-3 flex items-center gap-1">
                    <User className="w-3 h-3" />
                    Tutor: {booking.session?.tutorName || booking.tutorEmail || "N/A"}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    {count > 0 ? (
                      <span className="badge badge-success badge-outline">
                        {count} material{count !== 1 ? "s" : ""} available
                      </span>
                    ) : (
                      <span className="badge badge-warning badge-outline">
                        No material yet
                      </span>
                    )}

                    <span className="text-sm font-semibold text-indigo-600">
                      View
                    </span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </motion.section>
  );
};

const MaterialCard = ({ material, index, onView }) => {
  const materialImage = getMaterialImage(material);
  const materialLink = getMaterialLink(material);

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      className="group bg-base-100 border border-base-300 rounded-3xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
    >
      <div className="relative h-44 bg-base-300 overflow-hidden">
        {materialImage ? (
          <img
            src={materialImage}
            alt={material.title || "Material"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-base-content/40">
            <ImageIcon className="w-12 h-12" />
          </div>
        )}

        <div className="absolute top-3 left-3 badge badge-primary">
          Material #{index + 1}
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-base-content line-clamp-1">
            {material.title || "Untitled Material"}
          </h3>

          <p className="text-sm text-base-content/60 mt-1 flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {material.session?.title || "No Session Linked"}
          </p>

          <p className="text-xs text-base-content/50 mt-2 flex items-center gap-1">
            <User className="w-3 h-3" />
            Uploaded by: {material.tutorEmail || "N/A"}
          </p>
        </div>

        <p className="text-sm text-base-content/75 line-clamp-3">
          {material.description || "No description available."}
        </p>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onView(material)}
            className="btn btn-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0"
          >
            <Eye className="w-4 h-4" />
            View
          </button>

          {materialLink ? (
            <>
              <a
                href={materialLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </a>

              <a href={materialLink} download className="btn btn-sm btn-outline">
                <Download className="w-4 h-4" />
                Download
              </a>
            </>
          ) : (
            <span className="text-sm text-base-content/50">
              No file link available
            </span>
          )}
        </div>
      </div>
    </motion.article>
  );
};

const MaterialModal = ({ material, onClose }) => {
  if (!material) return null;

  const materialImage = getMaterialImage(material);
  const materialLink = getMaterialLink(material);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 24 }}
          transition={{ duration: 0.25 }}
          className="bg-base-100 text-base-content border border-base-300 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <div className="flex items-center justify-between gap-4 p-5 border-b border-base-300 bg-base-200">
            <div>
              <h3 className="text-2xl font-bold">
                {material.title || "Untitled Material"}
              </h3>

              <p className="text-sm text-base-content/60 mt-1">
                {material.session?.title || "No Session Linked"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-circle btn-outline"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 overflow-y-auto max-h-[calc(90vh-85px)] space-y-5">
            {materialImage ? (
              <img
                src={materialImage}
                alt={material.title || "Material"}
                className="w-full max-h-[360px] object-cover rounded-2xl border border-base-300"
                onError={(e) => {
                  e.target.src = placeholderImage;
                }}
              />
            ) : (
              <div className="w-full h-64 bg-base-200 border border-base-300 rounded-2xl flex flex-col items-center justify-center text-base-content/40">
                <ImageIcon className="w-12 h-12 mb-2" />
                <span>No Preview Image</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-base-200 border border-base-300">
                <BookOpen className="w-5 h-5 text-indigo-600 mb-2" />
                <p className="text-xs text-base-content/50">Session</p>
                <p className="font-semibold">
                  {material.session?.title || "N/A"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-base-200 border border-base-300">
                <User className="w-5 h-5 text-purple-600 mb-2" />
                <p className="text-xs text-base-content/50">Tutor</p>
                <p className="font-semibold">{material.tutorEmail || "N/A"}</p>
              </div>

              <div className="p-4 rounded-2xl bg-base-200 border border-base-300">
                <Calendar className="w-5 h-5 text-pink-600 mb-2" />
                <p className="text-xs text-base-content/50">Uploaded</p>
                <p className="font-semibold">
                  {formatDate(material.createdAt)}
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-base-200 border border-base-300">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Description
              </h4>

              <p className="text-base-content/70 leading-relaxed">
                {material.description || "No description available."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {materialLink ? (
                <>
                  <a
                    href={materialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Material
                  </a>

                  <a href={materialLink} download className="btn btn-outline">
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                </>
              ) : (
                <span className="text-sm text-base-content/50">
                  No file link available
                </span>
              )}

              <button type="button" onClick={onClose} className="btn btn-ghost">
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const StudentMaterials = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = UseAuth();

  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [filterSessionId, setFilterSessionId] = useState("");
  const [searchText, setSearchText] = useState("");

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
  const {
    data: approvedMaterials = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["approvedMaterials", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const res = await axiosSecure.get(
        `/materials/approved?email=${user.email}`
      );
      return res.data;
    },
    enabled: !!user?.email,
  });

  const filteredMaterials = useMemo(() => {
    let result = approvedMaterials;

    if (filterSessionId) {
      result = result.filter(
        (material) => getMaterialSessionId(material) === filterSessionId
      );
    }

    if (searchText.trim()) {
      const search = searchText.toLowerCase();

      result = result.filter((material) => {
        const title = material.title?.toLowerCase() || "";
        const description = material.description?.toLowerCase() || "";
        const sessionTitle = material.session?.title?.toLowerCase() || "";
        const tutorEmail = material.tutorEmail?.toLowerCase() || "";

        return (
          title.includes(search) ||
          description.includes(search) ||
          sessionTitle.includes(search) ||
          tutorEmail.includes(search)
        );
      });
    }

    return result;
  }, [approvedMaterials, filterSessionId, searchText]);

  const selectedSessionTitle = useMemo(() => {
    if (!filterSessionId) return "All Sessions";

    const booking = bookings.find(
      (item) => getBookingSessionId(item) === filterSessionId
    );

    return booking?.session?.title || "Selected Session";
  }, [bookings, filterSessionId]);

  if (bookingsLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200 text-base-content">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-16 h-16 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200 text-base-content px-4">
        <div className="text-center bg-base-100 border border-base-300 rounded-3xl shadow-xl p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-2" />
          <h3 className="text-xl font-bold">Failed to load materials</h3>
          <p className="text-base-content/60 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content py-8 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
          className="relative text-center"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-20 rounded-3xl"></div>
          </div>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl mb-4">
            <FolderOpen className="w-8 h-8" />
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            Study Materials
          </h2>

          <p className="text-base-content/70 mt-3 text-lg max-w-2xl mx-auto">
            Access approved resources from your booked study sessions.
          </p>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "130px" }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-5 rounded-full"
          />
        </motion.header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            icon={BookOpen}
            label="Booked Sessions"
            value={bookings.length}
          />

          <StatCard
            icon={FileText}
            label="Approved Materials"
            value={approvedMaterials.length}
          />

          <StatCard
            icon={Sparkles}
            label="Showing"
            value={filteredMaterials.length}
            gradient
          />
        </div>

        {/* NEW: Session-wise Material Finder */}
        <BookedSessionMaterialFinder
          bookings={bookings}
          materials={approvedMaterials}
          selectedSessionId={filterSessionId}
          onSelectSession={setFilterSessionId}
        />

        {/* Filter Panel */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
            <div>
              <h3 className="text-2xl font-bold text-base-content flex items-center gap-2">
                <Filter className="w-6 h-6 text-indigo-600" />
                Filter Materials
              </h3>

              <p className="text-base-content/60 mt-1">
                Currently showing:{" "}
                <span className="font-semibold text-base-content">
                  {selectedSessionTitle}
                </span>
              </p>
            </div>

            {(filterSessionId || searchText) && (
              <button
                type="button"
                onClick={() => {
                  setFilterSessionId("");
                  setSearchText("");
                }}
                className="btn btn-sm btn-outline w-fit"
              >
                Clear Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="label text-sm font-medium text-base-content/80 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Session
              </label>

              <select
                value={filterSessionId}
                onChange={(e) => setFilterSessionId(e.target.value)}
                className="select select-bordered w-full bg-base-100 text-base-content focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
              >
                <option value="">All Sessions</option>

                {bookings.map((booking, index) => {
                  const sessionId = getBookingSessionId(booking);

                  return (
                    <option
                      key={sessionId || `booking-${index}`}
                      value={sessionId}
                    >
                      {booking.session?.title || "Untitled Session"}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="label text-sm font-medium text-base-content/80 flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-600" />
                Search
              </label>

              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="input input-bordered w-full bg-base-100 text-base-content focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                placeholder="Search by title, description, session, or tutor..."
              />
            </div>
          </div>
        </motion.section>

        {/* Materials Library */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-base-content flex items-center gap-2">
                <Layers className="w-6 h-6 text-purple-600" />
                Materials Library
              </h3>

              <p className="text-base-content/60 mt-1">
                View, open, and download all available study materials.
              </p>
            </div>

            <span className="badge badge-primary badge-outline badge-lg w-fit">
              {filteredMaterials.length} Material
              {filteredMaterials.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filteredMaterials.length === 0 ? (
            <EmptyState
              title="No materials found"
              text={
                approvedMaterials.length === 0
                  ? "No approved materials are available yet."
                  : "No material is available for this selected booked session yet."
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMaterials.map((material, index) => (
                <MaterialCard
                  key={material._id || `material-${index}`}
                  material={material}
                  index={index}
                  onView={setSelectedMaterial}
                />
              ))}
            </div>
          )}
        </motion.section>

        <MaterialModal
          material={selectedMaterial}
          onClose={() => setSelectedMaterial(null)}
        />
      </div>
    </div>
  );
};

export default StudentMaterials;