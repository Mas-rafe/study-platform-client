import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BannerCarousel = () => {
  // ✅ Array of slides with image, title, and subtitle
  const slides = [
    {
      image: "/assets/image2.jpg",
      title: "Unlock Your Potential with Expert Tutors",
      subtitle: "Join thousands of learners on their journey to success.",
    },
    {
      image: "/assets/image1.jpg",
      title: "Learn Anytime, Anywhere",
      subtitle: "Access study materials and book sessions at your convenience.",
    },
    {
      image: "/assets/image3.jpg",
      title: "Boost Your Learning Journey",
      subtitle: "Engage with top educators and improve your skills daily.",
    },
  ];

  const [current, setCurrent] = useState(0);

  // ✅ Auto change every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  return (
    <section className="relative h-screen overflow-hidden">
      {/* Background images */}
      <AnimatePresence>
        <motion.div
          key={current}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slides[current].image})` }}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 1 }}
        >
          {/* Overlay with text */}
          <div className="w-full h-full bg-black/60 flex items-center justify-start md:justify-center text-left md:text-center px-6 md:px-0">
            <motion.div
              key={`text-${current}`}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="text-white max-w-2xl"
            >
              <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                {slides[current].title}
              </h1>
              <p className="text-lg md:text-xl mb-6">{slides[current].subtitle}</p>
              <a href="/sessions" className="btn btn-primary">
                Explore Sessions
              </a>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Left & Right Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-5 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-5 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full transition"
      >
        <ChevronRight size={28} />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              current === index
                ? "bg-white scale-125"
                : "bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
};

export default BannerCarousel;
