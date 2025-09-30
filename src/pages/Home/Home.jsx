import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, BookOpen, Users, Award } from "lucide-react";
import { useState, useEffect } from "react";
import useAxiosSecure from "../../Hooks/UseAxiosSecure";
import { Link } from "react-router";


const bannerImages = [
  "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b",
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b",
  "https://images.unsplash.com/photo-1513258496099-48168024aec0",
];

const Home = () => {
  const axiosSecure = useAxiosSecure();

  // Sessions Query
  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ["approvedSessions"],
    queryFn: async () => {
      const res = await axiosSecure.get("/sessions?status=approved");
      return res.data;
    },
  });

  // Carousel state
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % bannerImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-50">
      {/* Banner Carousel */}
      <section className="relative h-[70vh] overflow-hidden rounded-2xl mb-12">
        {bannerImages.map((img, index) => (
          <motion.div
            key={index}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${img})` }}
            initial={{ opacity: 0 }}
            animate={{ opacity: current === index ? 1 : 0 }}
            transition={{ duration: 1 }}
          >
            <div className="w-full h-full bg-black bg-opacity-60 flex items-center justify-center text-center">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{
                  y: current === index ? 0 : 50,
                  opacity: current === index ? 1 : 0,
                }}
                transition={{ duration: 0.8 }}
                className="text-white px-4"
              >
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  Unlock Knowledge, Anytime, Anywhere
                </h1>
                <p className="mb-6 text-lg md:text-xl max-w-2xl mx-auto">
                  Book study sessions with expert tutors, access study
                  materials, and boost your learning journey.
                </p>
                <Link to="/sessions" className="btn btn-primary">
                  Explore Sessions
                </Link>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Sessions Section */}
      <section className="py-12 container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-2">
          <BookOpen className="text-blue-600" /> Available Study Sessions
        </h2>
        {sessionsLoading ? (
          <p className="text-center">Loading sessions…</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.slice(0, 6).map((s) => {
              const now = new Date();
              const regStart = new Date(s.registrationStart);
              const regEnd = new Date(s.registrationEnd);
              const status =
                now >= regStart && now <= regEnd ? "Ongoing" : "Closed";

              return (
                <motion.div
                  key={s._id}
                  className="card bg-base-100 shadow-xl border"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="card-body">
                    <h3 className="card-title">{s.title}</h3>
                    <p className="text-gray-600">{s.description}</p>
                    <p className="text-sm font-medium">
                      Status:{" "}
                      <span
                        className={
                          status === "Ongoing"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {status}
                      </span>
                    </p>
                    {/* Reviews Preview */}
                    <ReviewsPreview sessionId={s._id} />
                    <div className="card-actions justify-end">
                      <Link
                        to={`/session-details/${s._id}`}
                        className="btn btn-primary btn-sm"
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Extra Section 1 */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <Users className="text-blue-600" /> Why Choose Us?
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform connects students with expert tutors, offers secure
            bookings, and provides access to high-quality study resources.
          </p>
        </div>
      </section>

      {/* Extra Section 2 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
            <Award className="text-yellow-500" /> Learn from Anywhere, Anytime
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            With online sessions, downloadable materials, and interactive
            resources, education is now at your fingertips.
          </p>
        </div>
      </section>
    </div>
  );
};

// Session-wise reviews preview
const ReviewsPreview = ({ sessionId }) => {
  const axiosSecure = useAxiosSecure();
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", sessionId],
    queryFn: async () => {
      const res = await axiosSecure.get(`/reviews/${sessionId}`);
      return res.data;
    },
  });

  if (!reviews.length) return <p className="text-sm text-gray-400">No reviews yet</p>;

  const avgRating =
    reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length;

  return (
    <div className="mt-3">
      <div className="flex items-center gap-1 text-yellow-500">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={16}
            className={i < avgRating ? "fill-yellow-500" : "text-gray-300"}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">
          ({reviews.length} reviews)
        </span>
      </div>
    </div>
  );
};

export default Home;
