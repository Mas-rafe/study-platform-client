import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router";
import Swal from "sweetalert2";
import {
  BookOpen,
  Users,
  Award,
  Star,
  Clock,
  FileText,
  MessageCircle,
  ChevronRight,
  Sparkles,
  Shield,
  Zap,
  Download,
  ArrowRight,
  CheckCircle,
  CalendarDays,
  User,
  GraduationCap,
  NotebookPen,
  Layers,
  Search,
  PlayCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

import useAxiosSecure from "../../Hooks/UseAxiosSecure";

const heroImage =
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80";

const sessionFallbackImage =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80";

const Section = ({ children, className = "" }) => {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6 }}
      className={`py-12 md:py-16 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
    </motion.section>
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

const getSessionStatus = (session) => {
  const registrationStart = session?.registrationStart;
  const registrationEnd = session?.registrationEnd;

  if (!registrationStart || !registrationEnd) return "Ongoing";

  const now = new Date();
  const start = new Date(registrationStart);
  const end = new Date(registrationEnd);

  return now >= start && now <= end ? "Ongoing" : "Closed";
};

const formatFee = (session) => {
  const fee = session?.registrationFee ?? session?.fee;

  if (fee === undefined || fee === null || fee === "") return "N/A";
  if (Number(fee) === 0) return "Free";

  return `$${fee}`;
};

const getReviewerName = (review) => {
  return (
    review?.userName ||
    review?.studentName ||
    review?.name ||
    review?.studentEmail ||
    "Student"
  );
};

const StatusBadge = ({ status }) => {
  if (status === "Ongoing") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg bg-emerald-500/95 text-white border border-emerald-200/70">
        <CheckCircle className="w-3.5 h-3.5" />
        Ongoing
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg bg-rose-500/95 text-white border border-rose-200/70">
      <AlertCircle className="w-3.5 h-3.5" />
      Closed
    </span>
  );
};

const Home = () => {
  const axiosSecure = useAxiosSecure();

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["approvedSessions"],
    queryFn: async () => {
      const res = await axiosSecure.get("/sessions?status=approved");
      return res.data;
    },
  });

  const { data: allReviews = [] } = useQuery({
    queryKey: ["allReviews"],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get("/reviews");
        return res.data;
      } catch (err) {
        console.warn("Failed to fetch reviews:", err);
        return [];
      }
    },
  });

  const {
    data: stats = {
      sessions: 0,
      students: 0,
      tutors: 0,
      materials: 0,
    },
  } = useQuery({
    queryKey: ["platformStats"],
    queryFn: async () => {
      try {
        const [sessionsRes, usersRes, materialsRes] = await Promise.all([
          axiosSecure
            .get("/sessions/count")
            .catch(() => ({ data: { count: 0 } })),
          axiosSecure
            .get("/users/count")
            .catch(() => ({ data: { students: 0, tutors: 0 } })),
          axiosSecure
            .get("/materials/approved/count")
            .catch(() => ({ data: { count: 0 } })),
        ]);

        return {
          sessions: sessionsRes.data.count || 0,
          students: usersRes.data.students || 0,
          tutors: usersRes.data.tutors || 0,
          materials: materialsRes.data.count || 0,
        };
      } catch (err) {
        console.warn("Failed to fetch stats:", err);
        return {
          sessions: 0,
          students: 0,
          tutors: 0,
          materials: 0,
        };
      }
    },
  });

  const featuredSessions = useMemo(() => {
    return sessions.slice(0, 6);
  }, [sessions]);

  const topReviews = useMemo(() => {
    return allReviews
      .filter((review) => Number(review.rating) >= 4 && review.comment)
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 3);
  }, [allReviews]);

  const heroStats = [
    {
      icon: BookOpen,
      label: "Sessions",
      value: stats.sessions,
    },
    {
      icon: Users,
      label: "Students",
      value: stats.students,
    },
    {
      icon: Award,
      label: "Tutors",
      value: stats.tutors,
    },
  ];

  return (
    <div className="min-h-screen bg-base-200 text-base-content transition-colors duration-300">
      {/* Hero */}
      <section className="relative min-h-[680px] overflow-hidden">
        <img
          src={heroImage}
          alt="Students learning together"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-indigo-700/95 via-purple-700/90 to-pink-500/80"></div>
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-28 -left-28 w-96 h-96 bg-white/20 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20 md:pt-36 md:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75 }}
              className="text-white"
            >
              <div className="inline-flex items-center gap-2 bg-white/15 border border-white/25 backdrop-blur-md rounded-full px-4 py-2 text-sm mb-6">
                <Sparkles className="w-4 h-4 text-yellow-200" />
                Smart study platform for students and tutors
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
                Learn Better with Guided Study Sessions
              </h1>

              <p className="text-white/90 text-lg md:text-xl mt-6 max-w-2xl leading-relaxed">
                Book tutor-led study sessions, access learning materials, write
                personal notes, and improve your academic progress from one
                organized platform.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link
                  to="/study-sessions"
                  className="btn btn-lg bg-white text-indigo-700 hover:bg-white/90 border-0"
                >
                  Explore Sessions
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <Link
                  to="/register"
                  className="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-indigo-700"
                >
                  Join as Student
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 mt-10 max-w-xl">
                {heroStats.map((item) => (
                  <div
                    key={item.label}
                    className="bg-white/15 border border-white/20 backdrop-blur-md rounded-2xl p-4"
                  >
                    <item.icon className="w-6 h-6 text-white mb-2" />
                    <p className="text-2xl font-bold">{item.value}+</p>
                    <p className="text-xs text-white/75">{item.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="bg-white/15 border border-white/25 backdrop-blur-xl rounded-[2rem] p-5 shadow-2xl"
            >
              <div className="bg-base-100 text-base-content rounded-[1.5rem] overflow-hidden shadow-xl">
                <div className="h-56 bg-base-300 overflow-hidden">
                  <img
                    src={
                      featuredSessions[0]?.image ||
                      featuredSessions[0]?.imageUrl ||
                      sessionFallbackImage
                    }
                    alt="Featured study session"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = sessionFallbackImage;
                    }}
                  />
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="badge badge-primary badge-outline">
                      Featured Session
                    </span>

                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-yellow-500" />
                      <span className="text-sm font-semibold text-base-content">
                        4.8
                      </span>
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold line-clamp-2">
                    {featuredSessions[0]?.title || "Start Your Next Study Plan"}
                  </h3>

                  <p className="text-base-content/60 mt-3 line-clamp-3">
                    {featuredSessions[0]?.description ||
                      "Explore available study sessions, connect with tutors, and access learning materials after booking."}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <div className="bg-base-200 border border-base-300 rounded-2xl p-4">
                      <CalendarDays className="w-5 h-5 text-indigo-600 mb-2" />
                      <p className="text-xs text-base-content/50">
                        Registration
                      </p>
                      <p className="font-semibold text-sm">
                        {featuredSessions[0]
                          ? formatDate(featuredSessions[0].registrationEnd)
                          : "Available"}
                      </p>
                    </div>

                    <div className="bg-base-200 border border-base-300 rounded-2xl p-4">
                      <Clock className="w-5 h-5 text-purple-600 mb-2" />
                      <p className="text-xs text-base-content/50">Status</p>
                      <p className="font-semibold text-sm">
                        {featuredSessions[0]
                          ? getSessionStatus(featuredSessions[0])
                          : "Ongoing"}
                      </p>
                    </div>
                  </div>

                  <Link
                    to={
                      featuredSessions[0]?._id
                        ? `/session-details/${featuredSessions[0]._id}`
                        : "/study-sessions"
                    }
                    className="btn w-full mt-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0"
                  >
                    View Featured Session
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="relative z-10 -mt-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              icon: BookOpen,
              label: "Total Sessions",
              value: stats.sessions,
            },
            {
              icon: Users,
              label: "Active Students",
              value: stats.students,
            },
            {
              icon: Award,
              label: "Expert Tutors",
              value: stats.tutors,
            },
            {
              icon: FileText,
              label: "Study Materials",
              value: stats.materials,
            },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-5 md:p-6"
            >
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mb-4">
                <stat.icon className="w-6 h-6" />
              </div>

              <p className="text-2xl md:text-3xl font-bold">
                {stat.value}+
              </p>
              <p className="text-sm text-base-content/60">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Sessions */}
      <Section className="pt-20">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 mb-3">
              <BookOpen className="w-4 h-4" />
              Available Learning Opportunities
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-base-content">
              Featured Study Sessions
            </h2>

            <p className="text-base-content/65 mt-3 max-w-2xl">
              Browse expert-led sessions, check registration status, and choose
              the right class for your learning goals.
            </p>
          </div>

          <Link
            to="/study-sessions"
            className="btn bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 w-fit"
          >
            See All Sessions
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {sessionsLoading ? (
          <div className="flex justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="w-14 h-14 text-primary" />
            </motion.div>
          </div>
        ) : featuredSessions.length === 0 ? (
          <EmptyState
            title="No sessions available"
            text="Approved study sessions will appear here when tutors publish them."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-stretch">
            {featuredSessions.map((session, index) => (
              <SessionCard
                key={session._id || `session-${index}`}
                session={session}
                index={index}
              />
            ))}
          </div>
        )}
      </Section>

      {/* Why Choose */}
      <Section className="bg-base-100">
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 mb-3">
              <Shield className="w-4 h-4" />
              Why StudyHub Works
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-base-content">
              Everything students need after booking a session
            </h2>

            <p className="text-base-content/65 mt-4 leading-relaxed">
              This platform is not only for booking. Students can access
              session-wise materials, create notes for booked sessions, view
              tutor information, and review their learning experience.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Link
                to="/study-sessions"
                className="btn bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0"
              >
                Browse Sessions
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link to="/register" className="btn btn-outline">
                Create Account
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: Zap,
                title: "Quick Booking",
                text: "Students can book approved sessions easily and access them from the dashboard.",
              },
              {
                icon: FileText,
                title: "Session Materials",
                text: "Tutors can upload materials and students can access resources for booked sessions.",
              },
              {
                icon: NotebookPen,
                title: "Personal Notes",
                text: "Students can write and manage notes linked with their booked sessions.",
              },
              {
                icon: Star,
                title: "Student Reviews",
                text: "Students can share feedback and help others understand session quality.",
              },
            ].map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </Section>

      {/* How It Works */}
      <Section>
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 mb-3">
            <PlayCircle className="w-4 h-4" />
            Simple Process
          </span>

          <h2 className="text-3xl md:text-4xl font-bold text-base-content">
            How It Works
          </h2>

          <p className="text-base-content/65 mt-3 max-w-2xl mx-auto">
            From browsing sessions to accessing materials, everything is
            organized for a smooth student experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[
            {
              step: "01",
              title: "Browse Sessions",
              icon: Search,
              desc: "Find available tutor-led sessions.",
            },
            {
              step: "02",
              title: "Book Session",
              icon: CheckCircle,
              desc: "Book your preferred session.",
            },
            {
              step: "03",
              title: "Access Materials",
              icon: Download,
              desc: "Use materials uploaded by tutors.",
            },
            {
              step: "04",
              title: "Create Notes",
              icon: NotebookPen,
              desc: "Save notes for revision.",
            },
          ].map((item, index) => (
            <ProcessCard key={item.step} item={item} index={index} />
          ))}
        </div>
      </Section>

      {/* Testimonials */}
      <Section className="bg-base-100">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 mb-3">
            <MessageCircle className="w-4 h-4" />
            Student Feedback
          </span>

          <h2 className="text-3xl md:text-4xl font-bold text-base-content">
            What Students Say
          </h2>

          <p className="text-base-content/65 mt-3 max-w-2xl mx-auto">
            Real feedback from students helps make the platform more reliable
            and useful.
          </p>
        </div>

        {topReviews.length === 0 ? (
          <EmptyState
            title="No reviews yet"
            text="Student reviews will appear here after sessions receive feedback."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {topReviews.map((review, index) => (
              <ReviewCard key={review._id || index} review={review} index={index} />
            ))}
          </div>
        )}
      </Section>

      {/* FAQ */}
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 items-start">
          <div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 mb-3">
              <MessageCircle className="w-4 h-4" />
              Questions
            </span>

            <h2 className="text-3xl md:text-4xl font-bold text-base-content">
              Frequently Asked Questions
            </h2>

            <p className="text-base-content/65 mt-4 leading-relaxed">
              These quick answers explain the main features students will use
              after joining the platform.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Can students book sessions?",
                a: "Yes. Students can book approved sessions while registration is open.",
              },
              {
                q: "Can students access materials?",
                a: "Yes. After booking, students can view and download available study materials.",
              },
              {
                q: "Can students create notes?",
                a: "Yes. Students can create notes based on their booked sessions.",
              },
              {
                q: "Can students submit reviews?",
                a: "Yes. Students can submit ratings and feedback for sessions.",
              },
            ].map((faq, index) => (
              <FAQItem key={faq.q} faq={faq} index={index} />
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-base-100">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-8 md:p-12 shadow-xl">
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/15 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-white/15 rounded-full blur-3xl"></div>

          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to start your learning journey?
              </h2>

              <p className="text-white/85 mt-3 max-w-2xl">
                Browse available sessions, book your class, and manage your
                materials and notes from the student dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/study-sessions"
                className="btn bg-white text-indigo-700 hover:bg-white/90 border-0"
              >
                Browse Sessions
              </Link>

              <Link
                to="/register"
                className="btn btn-outline text-white border-white hover:bg-white hover:text-indigo-700"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </Section>
    </div>
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

const SessionCard = ({ session, index }) => {
  const status = getSessionStatus(session);

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -7 }}
      className="group h-full"
    >
      <div className="h-full bg-base-100 border border-base-300 rounded-3xl shadow-md hover:shadow-xl transition-all overflow-hidden flex flex-col">
        <div className="relative h-52 bg-base-300 overflow-hidden flex-shrink-0">
          <img
            src={session.image || session.imageUrl || sessionFallbackImage}
            alt={session.title || "Study Session"}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              e.target.src = sessionFallbackImage;
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>

          <div className="absolute top-3 left-3">
            <StatusBadge status={status} />
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-xl font-bold text-base-content line-clamp-2 min-h-[60px]">
            {session.title || "Untitled Session"}
          </h3>

          <p className="text-sm text-base-content/65 mt-2 line-clamp-3 min-h-[66px]">
            {session.description || "No description available for this session."}
          </p>

          <div className="grid grid-cols-1 gap-3 mt-5 flex-1">
            <InfoRow
              icon={User}
              label="Tutor"
              value={session.tutorName || session.tutorEmail || "N/A"}
            />

            <InfoRow
              icon={CalendarDays}
              label="Registration Ends"
              value={formatDate(session.registrationEnd)}
            />

            <InfoRow
              icon={Clock}
              label="Fee"
              value={formatFee(session)}
            />
          </div>

          <Link
            to={`/session-details/${session._id}`}
            className="btn w-full mt-5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0"
          >
            View Details
            <ChevronRight className="w-4 h-4" />
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

const FeatureCard = ({ feature, index }) => {
  const Icon = feature.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -5 }}
      className="bg-base-200 border border-base-300 rounded-3xl p-6 h-full"
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>

      <h3 className="font-bold text-lg text-base-content">{feature.title}</h3>

      <p className="text-base-content/60 text-sm mt-2 leading-relaxed">
        {feature.text}
      </p>
    </motion.div>
  );
};

const ProcessCard = ({ item, index }) => {
  const Icon = item.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className="relative bg-base-100 border border-base-300 rounded-3xl p-6 text-center shadow-lg h-full"
    >
      <div className="absolute top-4 right-4 text-4xl font-extrabold text-base-content/10">
        {item.step}
      </div>

      <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mb-5">
        <Icon className="w-8 h-8" />
      </div>

      <h3 className="font-bold text-lg text-base-content">{item.title}</h3>

      <p className="text-sm text-base-content/60 mt-2">{item.desc}</p>
    </motion.div>
  );
};

const ReviewCard = ({ review, index }) => {
  const reviewerName = getReviewerName(review);
  const initial = reviewerName.charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -5 }}
      className="bg-base-200 border border-base-300 rounded-3xl p-6 h-full"
    >
      <div className="flex items-center gap-1 text-yellow-500 mb-4">
        {[...Array(5)].map((_, index) => (
          <Star
            key={index}
            size={17}
            className={
              index < Number(review.rating || 0)
                ? "fill-yellow-500"
                : "text-base-content/30"
            }
          />
        ))}
      </div>

      <p className="text-base-content/75 leading-relaxed line-clamp-5">
        “{review.comment}”
      </p>

      <div className="mt-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold">
          {initial}
        </div>

        <div>
          <div className="font-bold text-base-content">{reviewerName}</div>
          <div className="text-sm text-base-content/60">Student</div>
        </div>
      </div>
    </motion.div>
  );
};

const FAQItem = ({ faq, index }) => {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ x: 5 }}
      onClick={() => Swal.fire(faq.q, faq.a, "question")}
      className="w-full text-left bg-base-100 border border-base-300 p-5 rounded-2xl shadow-md hover:shadow-lg transition-all"
    >
      <div className="flex justify-between items-center gap-4">
        <h3 className="font-semibold text-base-content">{faq.q}</h3>
        <MessageCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
      </div>
    </motion.button>
  );
};

const ReviewsPreview = ({ sessionId }) => {
  const axiosSecure = useAxiosSecure();

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", sessionId],
    queryFn: async () => {
      try {
        const res = await axiosSecure.get(`/reviews/${sessionId}`);
        return res.data;
      } catch {
        return [];
      }
    },
    enabled: !!sessionId,
  });

  if (!reviews.length) {
    return <span className="text-xs text-base-content/50">No reviews</span>;
  }

  const average =
    reviews.reduce((total, review) => total + Number(review.rating || 0), 0) /
    reviews.length;

  return (
    <div className="flex items-center gap-1 text-yellow-500">
      {[...Array(5)].map((_, index) => (
        <Star
          key={index}
          size={14}
          className={
            index < Math.round(average)
              ? "fill-yellow-500"
              : "text-base-content/30"
          }
        />
      ))}

      <span className="text-xs text-base-content/70">
        ({reviews.length})
      </span>
    </div>
  );
};

export default Home;