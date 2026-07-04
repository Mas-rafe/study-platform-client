import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  User,
  Mail,
  BookOpen,
  NotebookPen,
  Calendar,
  Sparkles,
  Save,
  Layers,
  CheckCircle,
} from "lucide-react";

const placeholderImage = "https://via.placeholder.com/600x300?text=No+Image";

const formatDate = (date) => {
  if (!date) return "N/A";

  try {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "N/A";
  }
};

const CreateNote = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = UseAuth();

  const [formData, setFormData] = useState({
    sessionId: "",
    title: "",
    description: "",
  });

  // Fetch booked sessions for the student
  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ["myBookings", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const res = await axiosSecure.get(`/bookings/student/${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  // Fetch student notes
  const {
    data: notes = [],
    isLoading: notesLoading,
    refetch: refetchNotes,
  } = useQuery({
    queryKey: ["studentNotes", user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const res = await axiosSecure.get(`/notes/student/${user?.email}`);
      return res.data;
    },
    enabled: !!user?.email,
  });

  const selectedBooking = bookings.find((booking) => {
    const bookingSessionId = booking.sessionId || booking.session?._id;
    return bookingSessionId === formData.sessionId;
  });

  // Create note
  const mutation = useMutation({
    mutationFn: async ({ sessionId, title, description }) => {
      const res = await axiosSecure.post("/notes", {
        studentEmail: user?.email,
        sessionId,
        title,
        description,
      });

      return res.data;
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Saved!",
        text: "Note created successfully",
        customClass: {
          confirmButton:
            "btn btn-success bg-gradient-to-r from-green-500 to-emerald-600 text-white",
        },
        timer: 2000,
      });

      setFormData({
        sessionId: "",
        title: "",
        description: "",
      });

      refetchNotes();
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.response?.data?.message || err.message,
        customClass: {
          confirmButton:
            "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white",
        },
      });
    },
  });

  const isSaving = mutation.isPending || mutation.isLoading;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectSession = (sessionId) => {
    setFormData((prev) => ({
      ...prev,
      sessionId: sessionId || "",
    }));
  };

  const handleCreateNote = (e) => {
    e.preventDefault();

    const { sessionId, title, description } = formData;

    if (!sessionId || !title || !description) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Please select a session and provide title and description",
        customClass: {
          confirmButton:
            "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white",
        },
      });

      return;
    }

    mutation.mutate({ sessionId, title, description });
  };

  if (bookingsLoading || notesLoading) {
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
            <NotebookPen className="w-8 h-8" />
          </div>

          <h2 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            Create Notes
          </h2>

          <p className="text-base-content/70 mt-3 text-lg max-w-2xl mx-auto">
            Choose a booked session, then create a clear note for that exact
            session.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <span className="badge badge-primary badge-outline badge-lg">
              {bookings.length} Booked Session{bookings.length !== 1 ? "s" : ""}
            </span>

            <span className="badge badge-secondary badge-outline badge-lg">
              {notes.length} Note{notes.length !== 1 ? "s" : ""}
            </span>
          </div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "130px" }}
            transition={{ delay: 0.35, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-5 rounded-full"
          />
        </motion.header>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-base-100 border border-base-300 rounded-3xl shadow-lg p-6"
          >
            <BookOpen className="w-8 h-8 text-indigo-600 mb-3" />
            <p className="text-sm text-base-content/50">Booked Sessions</p>
            <h3 className="text-3xl font-bold mt-1">{bookings.length}</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-base-100 border border-base-300 rounded-3xl shadow-lg p-6"
          >
            <FileText className="w-8 h-8 text-purple-600 mb-3" />
            <p className="text-sm text-base-content/50">Saved Notes</p>
            <h3 className="text-3xl font-bold mt-1">{notes.length}</h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-3xl shadow-lg p-6"
          >
            <Sparkles className="w-8 h-8 mb-3" />
            <p className="text-sm text-white/70">Study Reminder</p>
            <h3 className="text-xl font-bold mt-1">
              Create notes after every session
            </h3>
          </motion.div>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Note Form */}
          <motion.section
            id="create-note"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 bg-base-100 border border-base-300 rounded-3xl shadow-xl overflow-hidden"
          >
            <div className="p-6 md:p-8 border-b border-base-300 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <Plus className="w-6 h-6" />
                Create a New Note
              </h3>

              <p className="text-white/80 mt-1">
                First select the booked session. Then write your note title and
                description.
              </p>
            </div>

            <form onSubmit={handleCreateNote} className="p-6 md:p-8 space-y-6">
              {/* Email */}
              <div>
                <label className="label text-sm font-medium text-base-content/80 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-600" />
                  Student Email
                </label>

                <input
                  className="input input-bordered w-full bg-base-200 text-base-content/70 cursor-not-allowed"
                  value={user?.email || ""}
                  readOnly
                />
              </div>

              {/* Booked Session Selector */}
              <div>
                <label className="label text-sm font-medium text-base-content/80 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  Choose Booked Session for This Note
                </label>

                {bookings.length === 0 ? (
                  <div className="bg-base-200 border border-base-300 rounded-2xl p-5 text-center">
                    <AlertCircle className="w-10 h-10 text-base-content/40 mx-auto mb-2" />
                    <p className="text-base-content/60">
                      You have no booked sessions yet. Book a session first to
                      create notes.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {bookings.map((booking, index) => {
                      const sessionId = booking.sessionId || booking.session?._id;
                      const isSelected = formData.sessionId === sessionId;

                      return (
                        <motion.button
                          type="button"
                          key={sessionId || `booking-${index}`}
                          whileHover={{ y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelectSession(sessionId)}
                          className={`text-left rounded-2xl border p-4 transition-all ${
                            isSelected
                              ? "border-indigo-500 bg-indigo-500/10 shadow-lg ring-2 ring-indigo-500/30"
                              : "border-base-300 bg-base-200 hover:bg-base-300"
                          }`}
                        >
                          <div className="flex gap-4">
                            {booking.session?.image ? (
                              <img
                                src={booking.session.image}
                                alt={booking.session?.title || "Session"}
                                className="w-16 h-16 rounded-xl object-cover"
                                onError={(e) => {
                                  e.target.src = placeholderImage;
                                }}
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-xl bg-base-300 flex items-center justify-center">
                                <ImageIcon className="w-7 h-7 text-base-content/40" />
                              </div>
                            )}

                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-bold text-base-content line-clamp-1">
                                  {booking.session?.title || "Untitled Session"}
                                </h4>

                                {isSelected && (
                                  <span className="badge badge-primary badge-sm">
                                    Selected
                                  </span>
                                )}
                              </div>

                              <p className="text-sm text-base-content/60 mt-1 line-clamp-2">
                                {booking.session?.description ||
                                  "No description available."}
                              </p>

                              <p className="text-xs text-base-content/50 mt-2 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                Tutor:{" "}
                                {booking.session?.tutorName ||
                                  booking.tutorEmail ||
                                  "N/A"}
                              </p>
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Selected Session Confirmation */}
              {selectedBooking ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-5 shadow-lg"
                >
                  <p className="text-sm text-white/80 mb-2">
                    You are creating this note for:
                  </p>

                  <div className="flex items-center gap-4">
                    {selectedBooking.session?.image ? (
                      <img
                        src={selectedBooking.session.image}
                        alt={selectedBooking.session?.title || "Session"}
                        className="w-16 h-16 rounded-xl object-cover border border-white/30"
                        onError={(e) => {
                          e.target.src = placeholderImage;
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-white/70" />
                      </div>
                    )}

                    <div>
                      <h4 className="text-lg font-bold">
                        {selectedBooking.session?.title || "Untitled Session"}
                      </h4>

                      <p className="text-sm text-white/80">
                        Tutor:{" "}
                        {selectedBooking.session?.tutorName ||
                          selectedBooking.tutorEmail ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="rounded-2xl bg-warning/10 border border-warning/30 p-4">
                  <p className="text-sm font-medium text-base-content/80">
                    Please choose one booked session before writing your note.
                  </p>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="label text-sm font-medium text-base-content/80 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Note Title
                </label>

                <input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input input-bordered w-full bg-base-100 text-base-content focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  placeholder="Example: Important React concepts from today"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="label text-sm font-medium text-base-content/80 flex items-center gap-2">
                  <NotebookPen className="w-4 h-4 text-indigo-600" />
                  Note Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered w-full bg-base-100 text-base-content focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                  placeholder="Write your learning points, questions, summary, or revision notes..."
                  rows={6}
                  required
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                disabled={isSaving || !formData.sessionId}
                className={`btn w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 rounded-xl flex items-center gap-2 ${
                  isSaving || !formData.sessionId
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Note
                  </>
                )}
              </motion.button>
            </form>
          </motion.section>

          {/* Right Help Panel */}
          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="lg:sticky lg:top-24 bg-base-100 border border-base-300 rounded-3xl shadow-xl p-6 space-y-5">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-600" />
                  Note Writing Tips
                </h3>

                <p className="text-base-content/60 text-sm mt-2">
                  A useful note should be short, clear, and easy to revise later.
                </p>
              </div>

              {[
                "Select the correct booked session first.",
                "Write the topic name clearly.",
                "Use short sentences for quick revision.",
                "Add questions you want to ask later.",
                "Summarize the class in your own words.",
              ].map((tip, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 rounded-2xl bg-base-200 border border-base-300"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-base-content/75">{tip}</p>
                </div>
              ))}
            </div>
          </motion.aside>
        </div>

        {/* Notes List */}
        {/* <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-base-100 border border-base-300 rounded-3xl shadow-xl p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <div>
              <h3 className="text-2xl font-bold text-base-content flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-600" />
                Your Notes Library
              </h3>

              <p className="text-base-content/60 mt-1">
                All notes you created from your booked sessions.
              </p>
            </div>

            <span className="badge badge-primary badge-outline badge-lg w-fit">
              {notes.length} Note{notes.length !== 1 ? "s" : ""}
            </span>
          </div>

          {notes.length === 0 ? (
            <div className="text-center py-12 bg-base-200 border border-base-300 rounded-3xl">
              <AlertCircle className="w-12 h-12 text-base-content/40 mx-auto mb-3" />
              <h4 className="font-bold text-lg text-base-content">
                No notes created yet
              </h4>
              <p className="text-base-content/60 mt-1">
                Select a booked session and create your first note.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {notes.map((note, index) => (
                <motion.article
                  key={note._id || `note-${index}`}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -6 }}
                  className="group bg-base-200 border border-base-300 rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                >
                  <div className="h-32 bg-base-300 overflow-hidden">
                    {note.session?.image ? (
                      <img
                        src={note.session.image}
                        alt={note.session.title || "Session"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                    <h4 className="font-bold text-lg text-base-content line-clamp-1">
                      {note.title || "Untitled Note"}
                    </h4>

                    <p className="text-sm text-base-content/60 mt-1 flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {note.session?.title || "No Session Linked"}
                    </p>

                    <p className="text-xs text-base-content/50 mt-2 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(note.createdAt)}
                    </p>

                    <p className="text-sm text-base-content/75 mt-4 line-clamp-4">
                      {note.description || "No description"}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </motion.section> */}
      </div>
    </div>
  );
};

export default CreateNote;