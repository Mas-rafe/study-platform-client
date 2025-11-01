
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router";
import {
  BookOpen, Users, Award, Star, Clock, FileText, MessageCircle,
  ChevronRight, Sparkles, Shield, Zap, Download
} from "lucide-react";

import useAxiosSecure from "../../Hooks/UseAxiosSecure";
import BannerCarousel from "../../Components/BannerCarousel";
import Swal from "sweetalert2";

// Reusable Section
const Section = ({ children, className = "" }) => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className={`py-12 md:py-16 ${className}`}
  >
    <div className="container mx-auto px-4">{children}</div>
  </motion.section>
);

const Home = () => {
  const axiosSecure = useAxiosSecure();

  // 1. Fetch Approved Sessions
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["approvedSessions"],
    queryFn: async () => {
      const res = await axiosSecure.get("/sessions?status=approved");
      return res.data;
    },
  });

  // 2. Fetch All Reviews (for testimonials)
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

  // 3. Fetch Platform Stats
  const { data: stats = { sessions: 0, students: 0, tutors: 0, materials: 0 } } = useQuery({
    queryKey: ["platformStats"],
    queryFn: async () => {
      try {
        const [sessionsRes, usersRes, materialsRes] = await Promise.all([
          axiosSecure.get("/sessions/count").catch(() => ({ data: { count: 0 } })),
          axiosSecure.get("/users/count").catch(() => ({ data: { students: 0, tutors: 0 } })),
          axiosSecure.get("/materials/approved/count").catch(() => ({ data: { count: 0 } })),
        ]);
        return {
          sessions: sessionsRes.data.count || 0,
          students: usersRes.data.students || 0,
          tutors: usersRes.data.tutors || 0,
          materials: materialsRes.data.count || 0,
        };
      } catch (err) {
        console.warn("Failed to fetch stats:", err);
        return { sessions: 0, students: 0, tutors: 0, materials: 0 };
      }
    },
  });

  // Top 3 reviews
  const topReviews = allReviews
    .filter(r => r.rating >= 4 && r.comment && r.userName)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* 1. Banner Carousel */}
      <BannerCarousel />

      {/* 2. Available Study Sessions - 5 ROWS × 3 COLUMNS (LG+) */}
      <Section className="bg-white/70 backdrop-blur-sm">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center gap-2">
            <BookOpen className="w-8 h-8" /> Available Study Sessions
          </h2>
          <p className="text-gray-600 mt-2">Join live classes with expert tutors</p>
        </div>

        {sessionsLoading ? (
          <div className="text-center py-12">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
              <Clock className="w-12 h-12 text-indigo-600 mx-auto" />
            </motion.div>
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-center text-gray-500">No sessions available.</p>
        ) : (
          <>
            {/* 5 ROWS × 3 COLUMNS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {sessions.slice(0, 15).map((s, idx) => {
                const now = new Date();
                const regStart = new Date(s.registrationStart);
                const regEnd = new Date(s.registrationEnd);
                const isOngoing = now >= regStart && now <= regEnd;

                return (
                  <motion.div
                    key={s._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-indigo-100 overflow-hidden"
                  >
                    {/* Image */}
                    <div className="h-48 relative overflow-hidden">
                      <img
                        src={s.image || "https://via.placeholder.com/400x200?text=Session+Image"}
                        alt={s.title}
                        className="w-full h-full object-cover"
                        onError={(e) => (e.target.src = "https://via.placeholder.com/400x200?text=No+Image")}
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          isOngoing ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {isOngoing ? "Ongoing" : "Closed"}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-800 line-clamp-1">{s.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">{s.description}</p>
                      <div className="mt-3">
                        <ReviewsPreview sessionId={s._id} />
                      </div>
                      <Link
                        to={`/session-details/${s._id}`}
                        className="mt-3 btn btn-sm w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                      >
                        View Details
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* See More */}
            <div className="text-center mt-10">
              <Link
                to="/study-sessions"
                className="inline-flex items-center gap-2 btn btn-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg"
              >
                See All Sessions <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </>
        )}
      </Section>

      {/* 3. Platform Stats */}
      <Section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { icon: BookOpen, label: "Total Sessions", value: stats.sessions },
            { icon: Users, label: "Active Students", value: stats.students },
            { icon: Award, label: "Expert Tutors", value: stats.tutors },
            { icon: FileText, label: "Study Materials", value: stats.materials },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center"
            >
              <stat.icon className="w-10 h-10 mb-2" />
              <div className="text-3xl font-bold">{stat.value}+</div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* 4. Why Choose Us */}
      <Section className="bg-white">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            Why Choose StudyHub?
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Shield, title: "Secure Payments", desc: "100% safe & encrypted" },
            { icon: Zap, title: "Instant Booking", desc: "Book in under 30 seconds" },
            { icon: Star, title: "Top-Rated Tutors", desc: "4.8+ average rating" },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="text-center p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl"
            >
              <feature.icon className="w-12 h-12 mx-auto mb-3 text-indigo-600" />
              <h3 className="font-bold text-lg">{feature.title}</h3>
              <p className="text-gray-600 mt-2">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* 5. Real Student Testimonials */}
      <Section className="bg-gray-50">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          What Students Say
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {topReviews.length > 0 ? (
            topReviews.map((r, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100"
              >
                <div className="flex items-center gap-1 text-yellow-500 mb-3">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} size={16} className={j < r.rating ? "fill-yellow-500" : "text-gray-300"} />
                  ))}
                </div>
                <p className="text-gray-700 italic">"{r.comment}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    {r.userName[0]}
                  </div>
                  <div>
                    <div className="font-bold">{r.userName}</div>
                    <div className="text-sm text-gray-500">Student</div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="col-span-3 text-center text-gray-500">No reviews yet.</p>
          )}
        </div>
      </Section>

      {/* 6. How It Works */}
      <Section className="bg-white">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
          How It Works
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: "1", title: "Browse Sessions", icon: BookOpen, desc: "Find live classes by subject" },
            { step: "2", title: "Book Instantly", icon: Zap, desc: "Secure your spot in 30 sec" },
            { step: "3", title: "Join Live Class", icon: Users, desc: "Interactive learning" },
            { step: "4", title: "Access Materials", icon: Download, desc: "Download notes & resources" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {item.step}
              </div>
              <item.icon className="w-10 h-10 mx-auto mb-3 text-indigo-600" />
              <h3 className="font-bold text-lg">{item.title}</h3>
              <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* 7. FAQ */}
      <Section className="bg-gradient-to-br from-indigo-50 to-purple-50">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
          Frequently Asked Questions
        </h2>
        <div className="max-w-3xl mx-auto space-y-4">
          {[
            { q: "Are the sessions live?", a: "Yes! All sessions are live with real-time interaction." },
            { q: "Can I download materials?", a: "Absolutely! All approved materials are downloadable." },
            { q: "Is payment secure?", a: "100% secure via SSL encryption." },
            { q: "Can I get a refund?", a: "Yes, full refund if cancelled 24 hours before." },
          ].map((faq, i) => (
            <motion.div
              key={i}
              whileHover={{ x: 5 }}
              className="bg-white p-5 rounded-lg shadow-md cursor-pointer"
              onClick={() => Swal.fire(faq.q, faq.a, "question")}
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">{faq.q}</h3>
                <MessageCircle className="w-5 h-5 text-indigo-600" />
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* 8. Call to Action */}
      <Section className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join {stats.students}+ students already improving their grades.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/all-sessions" className="btn btn-lg bg-white text-indigo-600 hover:bg-gray-100 font-bold">
              Browse Sessions
            </Link>
            <Link to="/register" className="btn btn-lg btn-outline text-white border-white hover:bg-white hover:text-indigo-600">
              Sign Up Free
            </Link>
          </div>
        </div>
      </Section>

      {/* 9. Footer Teaser */}
      <Section className="bg-gray-900 text-white py-8">
        <div className="text-center">
          <Sparkles className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
          <p className="text-sm">© 2025 StudyHub. Empowering Education.</p>
        </div>
      </Section>
    </div>
  );
};

// Reviews Preview
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
  });

  if (!reviews.length) return <span className="text-xs text-gray-400">No reviews</span>;

  const avg = reviews.reduce((a, b) => a + b.rating, 0) / reviews.length;

  return (
    <div className="flex items-center gap-1 text-yellow-500">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} className={i < Math.round(avg) ? "fill-yellow-500" : "text-gray-300"} />
      ))}
      <span className="text-xs text-gray-600">({reviews.length})</span>
    </div>
  );
};

export default Home;
