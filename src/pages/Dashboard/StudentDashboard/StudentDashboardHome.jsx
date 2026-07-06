import { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  BookOpen,
  Star,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Calendar,
  ChevronDown,
  Eye,
  NotebookPen,
  FolderOpen,
  ExternalLink,
  Sparkles,
  Layers,
  CheckCircle,
  DollarSign,
  Clock,
} from "lucide-react";

const placeholderImage = "https://via.placeholder.com/700x350?text=No+Image";

const normalizeId = (id) => {
  return id ? String(id) : "";
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

const formatFee = (session) => {
  const fee = session?.registrationFee ?? session?.fee;

  if (fee === undefined || fee === null) return "N/A";
  if (Number(fee) === 0) return "Free";

  return `$${fee}`;
};

const getSessionFromBooking = (booking) => {
  const session = booking.session || booking.sessionData || {};

  return {
    ...session,
    _id: session._id || booking.sessionId,
    title: session.title || booking.title || "Untitled Session",
    description:
      session.description ||
      booking.description ||
      "No description available for this session.",
    image: session.image || session.imageUrl || booking.image || "",
    tutorName: session.tutorName || booking.tutorName || "",
    tutorEmail: session.tutorEmail || booking.tutorEmail || "",
    registrationFee: session.registrationFee ?? booking.registrationFee,
    registrationStart: session.registrationStart || booking.registrationStart,
    registrationEnd: session.registrationEnd || booking.registrationEnd,
    classStart: session.classStart || booking.classStart,
    classEnd: session.classEnd || booking.classEnd,
    duration: session.duration || booking.duration,
  };
};

const getMaterialImage = (material) => {
  return material.imageUrl || material.image || "";
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

const StatCard = ({ icon: Icon, label, value, gradient = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
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

const QuickActionCard = ({ to, icon: Icon, title, text, gradient }) => {
  return (
    <RouterLink to={to}>
      <motion.div
        whileHover={{ y: -6 }}
        whileTap={{ scale: 0.98 }}
        className="h-full bg-base-100 border border-base-300 rounded-3xl shadow-lg hover:shadow-xl p-5 transition-all"
      >
        <div
          className={`w-12 h-12 rounded-2xl ${gradient} text-white flex items-center justify-center mb-4`}
        >
          <Icon className="w-6 h-6" />
        </div>

        <h3 className="font-bold text-lg text-base-content">{title}</h3>

        <p className="text-sm text-base-content/60 mt-1">{text}</p>
      </motion.div>
    </RouterLink>
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

const MaterialPreviewCard = ({ material }) => {
  const materialImage = getMaterialImage(material);
  const materialLink = getMaterialLink(material);

  return (
    <div className="bg-base-100 border border-base-300 rounded-2xl p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-32 h-24 rounded-xl bg-base-300 overflow-hidden flex-shrink-0">
          {materialImage ? (
            <img
              src={materialImage}
              alt={material.title || "Material"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = placeholderImage;
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-base-content/40">
              <ImageIcon className="w-8 h-8" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-bold text-base-content">
            {material.title || "Untitled Material"}
          </h4>

          <p className="text-sm text-base-content/60 mt-1 line-clamp-2">
            {material.description || "No description available."}
          </p>

          {materialLink ? (
            <div className="flex flex-wrap gap-2 mt-3">
              <a
                href={materialLink}
                target="_blank"
                rel="noreferrer"
                className="btn btn-xs bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0"
              >
                <ExternalLink className="w-3 h-3" />
                Open
              </a>

              <a href={materialLink} download className="btn btn-xs btn-outline">
                <Download className="w-3 h-3" />
                Download
              </a>
            </div>
          ) : (
            <p className="text-xs text-base-content/50 mt-3">
              No material link available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const BookedSessionCard = ({
  booking,
  index,
  expandedSession,
  onToggle,
  materials,
  isMaterialsLoading,
}) => {
  const session = getSessionFromBooking(booking);
  const sessionId = normalizeId(session._id || booking.sessionId);
  const isExpanded = expandedSession === sessionId;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="bg-base-100 border border-base-300 rounded-3xl shadow-lg overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr]">
        {/* Image */}
        <div className="h-56 lg:h-full bg-base-300 overflow-hidden">
          {session.image ? (
            <img
              src={session.image}
              alt={session.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = placeholderImage;
              }}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-base-content/40">
              <ImageIcon className="w-12 h-12 mb-2" />
              <span className="text-sm">No Image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="badge badge-success badge-outline">
                  Booked
                </span>

                {session.duration && (
                  <span className="badge badge-primary badge-outline">
                    {session.duration} hrs
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-bold text-base-content">
                {session.title}
              </h3>

              <p className="text-sm text-base-content/60 mt-2 line-clamp-2">
                {session.description}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onToggle(sessionId)}
              className="btn btn-sm btn-outline w-fit"
            >
              Materials
              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.25 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.span>
            </button>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-5">
            <div className="bg-base-200 border border-base-300 rounded-2xl p-3">
              <User className="w-4 h-4 text-indigo-600 mb-1" />
              <p className="text-xs text-base-content/50">Tutor</p>
              <p className="font-semibold text-sm text-base-content">
                {session.tutorName || session.tutorEmail || "N/A"}
              </p>
            </div>

            <div className="bg-base-200 border border-base-300 rounded-2xl p-3">
              <DollarSign className="w-4 h-4 text-green-600 mb-1" />
              <p className="text-xs text-base-content/50">Fee</p>
              <p className="font-semibold text-sm text-base-content">
                {formatFee(session)}
              </p>
            </div>

            <div className="bg-base-200 border border-base-300 rounded-2xl p-3">
              <Calendar className="w-4 h-4 text-purple-600 mb-1" />
              <p className="text-xs text-base-content/50">Registration</p>
              <p className="font-semibold text-sm text-base-content">
                {formatDate(session.registrationStart)} →{" "}
                {formatDate(session.registrationEnd)}
              </p>
            </div>

            <div className="bg-base-200 border border-base-300 rounded-2xl p-3">
              <Clock className="w-4 h-4 text-orange-600 mb-1" />
              <p className="text-xs text-base-content/50">Class</p>
              <p className="font-semibold text-sm text-base-content">
                {formatDate(session.classStart)} → {formatDate(session.classEnd)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-5">
            <RouterLink
              to={`/dashboard/student/bookings/${sessionId}`}
              className="btn btn-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0"
            >
              <Eye className="w-4 h-4" />
              View Details
            </RouterLink>

            <RouterLink
              to={`/dashboard/student/bookings/${sessionId}/materials`}
              className="btn btn-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0"
            >
              <FolderOpen className="w-4 h-4" />
              Session Materials
            </RouterLink>

            <RouterLink to="/dashboard/create-note" className="btn btn-sm btn-outline">
              <NotebookPen className="w-4 h-4" />
              Create Note
            </RouterLink>
          </div>

          {/* Materials Accordion */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-5 border-t border-base-300 pt-5 overflow-hidden"
              >
                <div className="bg-base-200 border border-base-300 rounded-3xl p-5">
                  <h4 className="font-bold text-base-content flex items-center gap-2 mb-4">
                    <FolderOpen className="w-5 h-5 text-indigo-600" />
                    Materials Preview
                  </h4>

                  {isMaterialsLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  ) : materials?.length === 0 ? (
                    <div className="text-center py-8">
                      <AlertCircle className="w-9 h-9 text-base-content/40 mx-auto mb-2" />
                      <p className="text-base-content/60">
                        No materials available for this session yet.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {materials?.slice(0, 4).map((material) => (
                        <MaterialPreviewCard
                          key={material._id}
                          material={material}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.article>
  );
};

const StudentDashboardHome = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = UseAuth();

  const [expandedSession, setExpandedSession] = useState(null);
  const [materialsForSession, setMaterialsForSession] = useState({});
  const [materialsLoading, setMaterialsLoading] = useState({});

  // Fetch student stats
  const {
    data: stats = {},
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ["studentStats", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/student/stats/${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  // Fetch booked sessions
  const {
    data: bookings = [],
    isLoading: bookingsLoading,
    error: bookingsError,
  } = useQuery({
    queryKey: ["studentBookings", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/bookings/student/${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  const totalBookings = bookings.length || stats?.totalBookings || 0;
  const totalReviews = stats?.totalReviews ?? 0;
  const totalMaterials = stats?.totalMaterials ?? 0;

  const latestBookings = useMemo(() => {
    return bookings.slice(0, 4);
  }, [bookings]);

  const fetchMaterials = async (sessionId) => {
    if (!sessionId) return;

    setMaterialsLoading((prev) => ({
      ...prev,
      [sessionId]: true,
    }));

    try {
      const res = await axiosSecure.get(`/materials/session/${sessionId}`);

      setMaterialsForSession((prev) => ({
        ...prev,
        [sessionId]: res.data || [],
      }));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.response?.data?.message || err.message,
        customClass: {
          confirmButton:
            "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white",
        },
        buttonsStyling: false,
      });

      setMaterialsForSession((prev) => ({
        ...prev,
        [sessionId]: [],
      }));
    } finally {
      setMaterialsLoading((prev) => ({
        ...prev,
        [sessionId]: false,
      }));
    }
  };

  const toggleAccordion = (sessionId) => {
    if (expandedSession === sessionId) {
      setExpandedSession(null);
      return;
    }

    setExpandedSession(sessionId);

    if (!materialsForSession[sessionId]) {
      fetchMaterials(sessionId);
    }
  };

  if (statsLoading || bookingsLoading) {
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

  if (statsError || bookingsError) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200 text-base-content px-4">
        <div className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-3" />
          <h2 className="text-xl font-bold">Failed to load dashboard</h2>
          <p className="text-base-content/60 mt-2">
            Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content py-8 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Header */}
        <motion.header
          initial={{ opacity: 0, y: -22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, type: "spring", stiffness: 100 }}
          className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-3xl shadow-xl p-6 md:p-10"
        >
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-white/10 rounded-full blur-2xl"></div>

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 backdrop-blur-md rounded-full px-4 py-2 text-sm mb-4">
                <CheckCircle className="w-4 h-4 text-green-300" />
                Student Dashboard
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold">
                Welcome, {user?.displayName || "Student"}
              </h1>

              <p className="text-white/80 mt-3 text-lg max-w-2xl">
                Manage your booked sessions, access materials, create notes, and
                track your learning progress.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <RouterLink
                to="/dashboard/create-note"
                className="btn bg-white text-indigo-700 hover:bg-white/90 border-0"
              >
                <NotebookPen className="w-4 h-4" />
                Create Note
              </RouterLink>

              <RouterLink
                to="/dashboard/my-notes"
                className="btn btn-outline text-white border-white hover:bg-white hover:text-indigo-700"
              >
                <BookOpen className="w-4 h-4" />
                My Notes
              </RouterLink>
            </div>
          </div>
        </motion.header>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard icon={BookOpen} label="Bookings" value={totalBookings} />

          <StatCard icon={Star} label="Reviews Given" value={totalReviews} />

          <StatCard
            icon={FileText}
            label="Materials Available"
            value={totalMaterials}
            gradient
          />
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <QuickActionCard
            to="/dashboard/my-bookings"
            icon={BookOpen}
            title="My Bookings"
            text="View all booked study sessions."
            gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
          />

          <QuickActionCard
            to="/dashboard/my-materials"
            icon={FolderOpen}
            title="Study Materials"
            text="Access available learning resources."
            gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
          />

          <QuickActionCard
            to="/dashboard/create-note"
            icon={NotebookPen}
            title="Create Notes"
            text="Write notes for booked sessions."
            gradient="bg-gradient-to-br from-purple-500 to-pink-600"
          />

          <QuickActionCard
            to="/dashboard/my-notes"
            icon={Layers}
            title="My Notes"
            text="Edit and organize saved notes."
            gradient="bg-gradient-to-br from-green-500 to-emerald-600"
          />
        </section>

        {/* Booked Sessions */}
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-base-content flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                Recent Booked Sessions
              </h2>

              <p className="text-base-content/60 mt-1">
                Preview your latest booked sessions and their materials.
              </p>
            </div>

            <RouterLink to="/dashboard/my-bookings" className="btn btn-sm btn-outline w-fit">
              View All Bookings
            </RouterLink>
          </div>

          {latestBookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              text="After you book a session, it will appear here."
            />
          ) : (
            <div className="space-y-6">
              {latestBookings.map((booking, index) => {
                const session = getSessionFromBooking(booking);
                const sessionId = normalizeId(session._id || booking.sessionId);

                return (
                  <BookedSessionCard
                    key={booking._id || `booking-${index}`}
                    booking={booking}
                    index={index}
                    expandedSession={expandedSession}
                    onToggle={toggleAccordion}
                    materials={materialsForSession[sessionId] || []}
                    isMaterialsLoading={materialsLoading[sessionId]}
                  />
                );
              })}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default StudentDashboardHome;