import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import { useParams } from "react-router";
import { motion } from "framer-motion";
import {
  BookOpen,
  User,
  DollarSign,
  CalendarDays,
  Clock,
  FileText,
  Download,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  ExternalLink,
  LibraryBig,
  ClipboardList,
  CheckCircle,
} from "lucide-react";

const StudentBookedSessionDetails = () => {
  const { id } = useParams();
  const axiosSecure = useAxiosSecure();

  const placeholderImage = "https://via.placeholder.com/1000x500?text=Study+Session";

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
    const fee = session.registrationFee ?? session.fee;

    if (fee === undefined || fee === null) return "N/A";
    if (Number(fee) === 0) return "Free";

    return `$${fee}`;
  };

  const {
    data: session = {},
    isLoading: sessionLoading,
    error: sessionError,
  } = useQuery({
    queryKey: ["sessionDetails", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/sessions/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  const {
    data: materials = [],
    isLoading: materialsLoading,
    error: materialsError,
  } = useQuery({
    queryKey: ["sessionMaterials", id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/materials/session/${id}`);
      return res.data;
    },
    enabled: !!id,
  });

  if (sessionLoading || materialsLoading) {
    return (
      <div className="min-h-screen bg-base-200 text-base-content flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-16 h-16 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (sessionError || materialsError) {
    return (
      <div className="min-h-screen bg-base-200 text-base-content flex items-center justify-center px-4">
        <div className="max-w-md bg-base-100 border border-base-300 rounded-3xl shadow-xl p-8 text-center">
          <AlertCircle className="w-14 h-14 text-error mx-auto mb-3" />
          <h2 className="text-2xl font-bold">Unable to load details</h2>
          <p className="text-base-content/60 mt-2">
            Something went wrong while loading this booked session.
          </p>
        </div>
      </div>
    );
  }

  const sessionImage = session.image || session.imageUrl || placeholderImage;

  const registrationStart = session.registrationStart || session.startDate;
  const registrationEnd = session.registrationEnd || session.endDate;
  const classStart = session.classStart || session.startDate;
  const classEnd = session.classEnd || session.endDate;

  return (
    <div className="min-h-screen bg-base-200 text-base-content transition-colors duration-300">
      {/* HERO SECTION */}
      <section className="relative min-h-[360px] overflow-hidden">
        <img
          src={sessionImage}
          alt={session.title || "Session"}
          onError={(e) => {
            e.target.src = placeholderImage;
          }}
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30"></div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl text-white"
          >
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full text-sm mb-5">
              <CheckCircle className="w-4 h-4 text-green-300" />
              Booked Session
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              {session.title || "Untitled Session"}
            </h1>

            <p className="text-white/80 mt-5 text-lg leading-relaxed">
              {session.description ||
                "View all important details, class schedule, tutor information, and study materials for this booked session."}
            </p>

            <div className="flex flex-wrap gap-3 mt-7">
              <span className="inline-flex items-center gap-2 bg-white text-indigo-700 px-4 py-2 rounded-xl font-semibold">
                <User className="w-4 h-4" />
                {session.tutorName || "Tutor N/A"}
              </span>

              <span className="inline-flex items-center gap-2 bg-indigo-500 text-white px-4 py-2 rounded-xl font-semibold">
                <DollarSign className="w-4 h-4" />
                {formatFee(session)}
              </span>

              <span className="inline-flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-xl font-semibold">
                <LibraryBig className="w-4 h-4" />
                {materials.length} Material{materials.length !== 1 ? "s" : ""}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FLOATING SUMMARY CARDS */}
      <section className="max-w-7xl mx-auto px-4 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-6"
          >
            <CalendarDays className="w-8 h-8 text-indigo-600 mb-3" />
            <p className="text-sm text-base-content/50">Registration Period</p>
            <h3 className="text-lg font-bold mt-1">
              {formatDate(registrationStart)} → {formatDate(registrationEnd)}
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-6"
          >
            <Clock className="w-8 h-8 text-purple-600 mb-3" />
            <p className="text-sm text-base-content/50">Class Schedule</p>
            <h3 className="text-lg font-bold mt-1">
              {formatDate(classStart)} → {formatDate(classEnd)}
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-6"
          >
            <BookOpen className="w-8 h-8 text-pink-600 mb-3" />
            <p className="text-sm text-base-content/50">Session Status</p>
            <h3 className="text-lg font-bold mt-1">Active Booking</h3>
          </motion.div>
        </div>
      </section>

      {/* MAIN DETAILS AREA */}
      <main className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT CONTENT */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview */}
          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-base-100 border border-base-300 rounded-3xl shadow-lg p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center">
                <ClipboardList className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-2xl font-bold">Session Overview</h2>
                <p className="text-base-content/60 text-sm">
                  Complete information about your booked class.
                </p>
              </div>
            </div>

            <p className="text-base-content/75 leading-relaxed text-lg">
              {session.description ||
                "No detailed description was provided for this session."}
            </p>
          </motion.section>

          {/* Timeline */}
          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-base-100 border border-base-300 rounded-3xl shadow-lg p-6 md:p-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <CalendarDays className="w-6 h-6 text-indigo-600" />
              Session Timeline
            </h2>

            <div className="relative pl-8 space-y-8">
              <div className="absolute left-3 top-2 bottom-2 w-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full"></div>

              <div className="relative">
                <div className="absolute -left-8 top-1 w-7 h-7 rounded-full bg-indigo-600 border-4 border-base-100"></div>
                <p className="text-sm text-base-content/50">Step 01</p>
                <h3 className="font-bold text-lg">Registration Opens</h3>
                <p className="text-base-content/70">
                  {formatDate(registrationStart)}
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-8 top-1 w-7 h-7 rounded-full bg-purple-600 border-4 border-base-100"></div>
                <p className="text-sm text-base-content/50">Step 02</p>
                <h3 className="font-bold text-lg">Registration Ends</h3>
                <p className="text-base-content/70">
                  {formatDate(registrationEnd)}
                </p>
              </div>

              <div className="relative">
                <div className="absolute -left-8 top-1 w-7 h-7 rounded-full bg-pink-600 border-4 border-base-100"></div>
                <p className="text-sm text-base-content/50">Step 03</p>
                <h3 className="font-bold text-lg">Class Starts</h3>
                <p className="text-base-content/70">{formatDate(classStart)}</p>
              </div>

              <div className="relative">
                <div className="absolute -left-8 top-1 w-7 h-7 rounded-full bg-orange-500 border-4 border-base-100"></div>
                <p className="text-sm text-base-content/50">Step 04</p>
                <h3 className="font-bold text-lg">Class Ends</h3>
                <p className="text-base-content/70">{formatDate(classEnd)}</p>
              </div>
            </div>
          </motion.section>

          {/* Materials */}
          <motion.section
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-base-100 border border-base-300 rounded-3xl shadow-lg p-6 md:p-8"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <LibraryBig className="w-6 h-6 text-purple-600" />
                  Resource Library
                </h2>
                <p className="text-base-content/60 text-sm mt-1">
                  Download or open materials shared by the tutor.
                </p>
              </div>

              <span className="badge badge-primary badge-outline badge-lg w-fit">
                {materials.length} Item{materials.length !== 1 ? "s" : ""}
              </span>
            </div>

            {materials.length === 0 ? (
              <div className="bg-base-200 border border-base-300 rounded-3xl p-10 text-center">
                <AlertCircle className="w-12 h-12 text-base-content/40 mx-auto mb-3" />
                <h3 className="font-bold text-lg">No materials yet</h3>
                <p className="text-base-content/60 mt-1">
                  Materials will appear here when the tutor uploads them.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {materials.map((mat, index) => {
                  const materialImage = mat.imageUrl || mat.image;
                  const materialLink =
                    mat.driveLink || mat.fileUrl || mat.imageUrl || mat.image;

                  return (
                    <motion.div
                      key={mat._id || `material-${index}`}
                      initial={{ opacity: 0, x: -18 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.08 }}
                      className="group bg-base-200 border border-base-300 rounded-2xl p-4 hover:shadow-lg transition-all"
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-36 h-28 rounded-xl bg-base-300 overflow-hidden flex-shrink-0">
                          {materialImage ? (
                            <img
                              src={materialImage}
                              alt={mat.title || "Material"}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-base-content/40">
                              <ImageIcon className="w-8 h-8" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <h3 className="font-bold text-lg">
                            {mat.title || "Untitled Material"}
                          </h3>

                          <p className="text-base-content/60 text-sm mt-1 line-clamp-2">
                            {mat.description || "No description available."}
                          </p>

                          <div className="flex flex-wrap gap-2 mt-4">
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

                                <a
                                  href={materialLink}
                                  download
                                  className="btn btn-sm btn-outline"
                                >
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
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.section>
        </div>

        {/* RIGHT STICKY SUMMARY */}
        <aside className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="lg:sticky lg:top-24 bg-base-100 border border-base-300 rounded-3xl shadow-xl p-6"
          >
            <h2 className="text-xl font-bold mb-5">Quick Summary</h2>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-base-200 border border-base-300">
                <p className="text-xs text-base-content/50 mb-1">Tutor</p>
                <p className="font-bold flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  {session.tutorName || "N/A"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-base-200 border border-base-300">
                <p className="text-xs text-base-content/50 mb-1">Fee</p>
                <p className="font-bold flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  {formatFee(session)}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-base-200 border border-base-300">
                <p className="text-xs text-base-content/50 mb-1">Materials</p>
                <p className="font-bold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600" />
                  {materials.length} available
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                <p className="text-xs text-white/70 mb-1">Booking Status</p>
                <p className="font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Confirmed
                </p>
              </div>
            </div>
          </motion.div>
        </aside>
      </main>
    </div>
  );
};

export default StudentBookedSessionDetails;