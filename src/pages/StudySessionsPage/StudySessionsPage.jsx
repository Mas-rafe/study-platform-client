import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../Hooks/UseAxiosSecure";
import UseAuth from "../../Hooks/UseAuth";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Link } from "react-router";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  Loader2,
  NotebookPen,
  Search,
  Sparkles,
  User,
  XCircle,
} from "lucide-react";

const heroImage =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80";

const placeholderImage =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=80";

const StudySessionsPage = () => {
  const axiosSecure = useAxiosSecure();
  const { role } = UseAuth();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const itemsPerPage = 8;

  const {
    data: sessions = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["studySessions", role],
    queryFn: async () => {
      if (role === "admin") {
        const res = await axiosSecure.get("/admin/sessions");
        return res.data;
      }

      const res = await axiosSecure.get("/sessions?status=approved");
      return res.data;
    },
  });

  const getSessionStatus = (session) => {
    if (role === "admin") return session.status || "N/A";

    return session.registrationEnd &&
      new Date(session.registrationEnd) < new Date()
      ? "Closed"
      : "Ongoing";
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    try {
      return format(new Date(date), "MMM d, yyyy");
    } catch {
      return "N/A";
    }
  };

  const formatFee = (session) => {
    const fee = session.registrationFee ?? session.fee;

    if (fee === undefined || fee === null || fee === "") return "N/A";
    if (Number(fee) === 0) return "Free";

    return `$${fee}`;
  };

  const isFreeSession = (session) => {
    const fee = session.registrationFee ?? session.fee;
    return fee !== undefined && fee !== null && Number(fee) === 0;
  };

  const filteredSessions = useMemo(() => {
    let result = sessions;

    if (searchText.trim()) {
      const search = searchText.toLowerCase();

      result = result.filter((session) => {
        const title = session.title?.toLowerCase() || "";
        const description = session.description?.toLowerCase() || "";
        const tutorName = session.tutorName?.toLowerCase() || "";
        const tutorEmail = session.tutorEmail?.toLowerCase() || "";

        return (
          title.includes(search) ||
          description.includes(search) ||
          tutorName.includes(search) ||
          tutorEmail.includes(search)
        );
      });
    }

    if (statusFilter !== "all") {
      result = result.filter((session) => {
        if (statusFilter === "free") return isFreeSession(session);

        const status = getSessionStatus(session).toLowerCase();
        return status === statusFilter;
      });
    }

    return result;
  }, [sessions, searchText, statusFilter, role]);

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);

  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, statusFilter]);

  const stats = useMemo(() => {
    if (role === "admin") {
      return [
        {
          icon: Layers,
          label: "Total Sessions",
          value: sessions.length,
        },
        {
          icon: CheckCircle,
          label: "Approved",
          value: sessions.filter((s) => s.status === "approved").length,
        },
        {
          icon: Clock,
          label: "Pending",
          value: sessions.filter((s) => s.status === "pending").length,
        },
        {
          icon: XCircle,
          label: "Rejected",
          value: sessions.filter((s) => s.status === "rejected").length,
        },
      ];
    }

    return [
      {
        icon: Layers,
        label: "Available Sessions",
        value: sessions.length,
      },
      {
        icon: CheckCircle,
        label: "Ongoing",
        value: sessions.filter((s) => getSessionStatus(s) === "Ongoing").length,
      },
      {
        icon: XCircle,
        label: "Closed",
        value: sessions.filter((s) => getSessionStatus(s) === "Closed").length,
      },
      {
        icon: DollarSign,
        label: "Free Sessions",
        value: sessions.filter((s) => isFreeSession(s)).length,
      },
    ];
  }, [sessions, role]);

  const statusOptions =
    role === "admin"
      ? [
          { label: "All", value: "all" },
          { label: "Approved", value: "approved" },
          { label: "Pending", value: "pending" },
          { label: "Rejected", value: "rejected" },
        ]
      : [
          { label: "All", value: "all" },
          { label: "Ongoing", value: "ongoing" },
          { label: "Closed", value: "closed" },
          { label: "Free", value: "free" },
        ];

  if (isLoading) {
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

  if (isError) {
    return (
      <div className="min-h-screen bg-base-200 text-base-content flex items-center justify-center px-4">
        <div className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-3" />
          <h2 className="text-xl font-bold">Failed to load sessions</h2>
          <p className="text-base-content/60 mt-2">
            {error?.message || "Please refresh the page and try again."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 text-base-content transition-colors duration-300">
      {/* Hero Section with Image */}
      <section className="relative min-h-[540px] overflow-hidden">
        <img
          src={heroImage}
          alt="Students learning together"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700/90 via-purple-700/85 to-pink-500/80"></div>
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="absolute -top-24 -right-24 w-80 h-80 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-white/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-md rounded-full px-4 py-2 text-sm mb-6">
              <Sparkles className="w-4 h-4 text-yellow-200" />
              Expert-led study sessions
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Find the Right Study Session for Your Learning Journey
            </h1>

            <p className="text-white/90 text-lg md:text-xl mt-6 max-w-3xl mx-auto leading-relaxed">
              Explore structured sessions, learn from tutors, access materials,
              and build your academic progress with confidence.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              <a
                href="#sessions"
                className="btn bg-white text-indigo-700 border-0 hover:bg-white/90"
              >
                Explore Sessions
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href="#how-it-works"
                className="btn btn-outline text-white border-white hover:bg-white hover:text-indigo-700"
              >
                How It Works
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 -mt-24 relative z-10">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </section>

        {/* Meaningful Section */}
        <section
          id="how-it-works"
          className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-6 md:p-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 mb-3">
                <GraduationCap className="w-4 h-4" />
                Learning Support
              </span>

              <h2 className="text-3xl md:text-4xl font-bold text-base-content">
                A better way to learn beyond regular classes
              </h2>

              <p className="text-base-content/65 mt-4 leading-relaxed">
                These study sessions are designed to help students revise,
                practice, and get topic-based support from tutors. After booking,
                students can access materials and create personal notes for each
                session.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FeatureBox
                icon={BookOpen}
                title="Join Sessions"
                text="Choose sessions based on your learning needs."
              />

              <FeatureBox
                icon={FileText}
                title="Get Materials"
                text="Access study resources after booking."
              />

              <FeatureBox
                icon={NotebookPen}
                title="Take Notes"
                text="Create notes linked with booked sessions."
              />
            </div>
          </div>
        </section>

        {/* Filter + Session Cards */}
        <section
          id="sessions"
          className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-6 md:p-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">
            <div>
              <h2 className="text-3xl font-bold text-base-content flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-indigo-600" />
                Available Study Sessions
              </h2>

              <p className="text-base-content/60 mt-2">
                Search and choose the right session for your academic goals.
              </p>
            </div>

            <div className="badge badge-primary badge-outline badge-lg w-fit">
              {filteredSessions.length} Session
              {filteredSessions.length !== 1 ? "s" : ""} Found
            </div>
          </div>

          {/* Search and Filter */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 mb-8">
            <div>
              <label className="label text-sm font-medium text-base-content/80 flex items-center gap-2">
                <Search className="w-4 h-4 text-indigo-600" />
                Search Sessions
              </label>

              <input
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="input input-bordered w-full bg-base-100 text-base-content focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                placeholder="Search by title, description, tutor name, or tutor email..."
              />
            </div>

            <div>
              <label className="label text-sm font-medium text-base-content/80 flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" />
                Filter
              </label>

              <div className="flex flex-wrap gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatusFilter(option.value)}
                    className={`btn btn-sm ${
                      statusFilter === option.value
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0"
                        : "btn-outline"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredSessions.length === 0 ? (
            <EmptyState
              title={
                sessions.length === 0
                  ? role === "admin"
                    ? "No sessions found"
                    : "No approved sessions available yet"
                  : "No matching sessions found"
              }
              text={
                sessions.length === 0
                  ? "Sessions will appear here after they are created and approved."
                  : "Try changing your search text or filter."
              }
            />
          ) : (
            <>
              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
                {paginatedSessions.map((session, index) => (
                  <SessionCard
                    key={session._id || `session-${index}`}
                    session={session}
                    index={index}
                    status={getSessionStatus(session)}
                    formatDate={formatDate}
                    formatFee={formatFee}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

const StatCard = ({ stat, index }) => {
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -5 }}
      className="bg-base-100 border border-base-300 text-base-content rounded-3xl shadow-xl p-6 h-full"
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>

      <p className="text-base-content/50 text-sm">{stat.label}</p>
      <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
    </motion.div>
  );
};

const FeatureBox = ({ icon: Icon, title, text }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-base-200 border border-base-300 rounded-3xl p-5 h-full"
    >
      <div className="w-12 h-12 rounded-2xl bg-base-100 border border-base-300 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-indigo-600" />
      </div>

      <h3 className="font-bold text-base-content">{title}</h3>
      <p className="text-sm text-base-content/60 mt-2 leading-relaxed">
        {text}
      </p>
    </motion.div>
  );
};

const SessionCard = ({ session, index, status, formatDate, formatFee }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -7 }}
      className="group h-full"
    >
      <div className="h-full bg-base-100 border border-base-300 rounded-3xl shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col">
        {/* Image */}
        <div className="relative h-48 bg-base-300 overflow-hidden flex-shrink-0">
          <img
            src={session.image || session.imageUrl || placeholderImage}
            alt={session.title || "Study Session"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = placeholderImage;
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>

          <div className="absolute top-3 left-3">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-base-content line-clamp-2 min-h-[56px]">
            {session.title || "Untitled Session"}
          </h3>

          <p className="text-sm text-base-content/65 mt-2 line-clamp-3 min-h-[64px]">
            {session.description || "No description available for this session."}
          </p>

          <div className="space-y-3 mt-4 flex-1">
            <InfoRow
              icon={User}
              label="Tutor"
              value={session.tutorName || session.tutorEmail || "N/A"}
            />

            <InfoRow icon={DollarSign} label="Fee" value={formatFee(session)} />

            <InfoRow
              icon={CalendarDays}
              label="Registration"
              value={`${formatDate(session.registrationStart)} → ${formatDate(
                session.registrationEnd
              )}`}
            />
          </div>

          <Link
            to={`/session-details/${session._id}`}
            className="btn w-full mt-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0"
          >
            View Session
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
};

const InfoRow = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-start gap-3 bg-base-200 border border-base-300 rounded-2xl p-3 min-h-[72px]">
      <Icon className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />

      <div>
        <p className="text-xs text-base-content/50">{label}</p>
        <p className="text-sm font-semibold text-base-content line-clamp-2">
          {value}
        </p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const lowerStatus = status?.toLowerCase();

  const baseClass =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg backdrop-blur-md border";

  if (lowerStatus === "approved" || lowerStatus === "ongoing") {
    return (
      <span
        className={`${baseClass} bg-emerald-500/95 text-white border-emerald-200/70`}
      >
        <CheckCircle className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  }

  if (lowerStatus === "pending") {
    return (
      <span
        className={`${baseClass} bg-amber-400/95 text-slate-900 border-amber-100/80`}
      >
        <Clock className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  }

  if (lowerStatus === "rejected" || lowerStatus === "closed") {
    return (
      <span
        className={`${baseClass} bg-rose-500/95 text-white border-rose-200/70`}
      >
        <XCircle className="w-3.5 h-3.5" />
        {status}
      </span>
    );
  }

  return (
    <span
      className={`${baseClass} bg-slate-900/90 text-white border-white/30`}
    >
      <AlertCircle className="w-3.5 h-3.5" />
      {status || "N/A"}
    </span>
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

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-wrap justify-center items-center gap-2 mt-10"
    >
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="btn btn-sm btn-outline"
      >
        <ChevronLeft className="w-4 h-4" />
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;

        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`btn btn-sm ${
              currentPage === page
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0"
                : "btn-outline"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="btn btn-sm btn-outline"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default StudySessionsPage;