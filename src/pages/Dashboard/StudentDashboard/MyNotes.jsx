import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Edit3,
  Trash2,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Filter,
  Search,
  BookOpen,
  Calendar,
  NotebookPen,
  Layers,
  Save,
  X,
  Sparkles,
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

const getBookingSessionId = (booking) => {
  return booking.sessionId || booking.session?._id || "";
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
      <Icon className={gradient ? "w-8 h-8 mb-3" : "w-8 h-8 text-indigo-600 mb-3"} />
      <p className={gradient ? "text-sm text-white/70" : "text-sm text-base-content/50"}>
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

const EditNoteForm = ({
  editFormData,
  onChange,
  onSave,
  onCancel,
  isSaving,
}) => {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-5 border-t border-base-300 pt-5 overflow-hidden"
    >
      <div className="rounded-2xl bg-base-200 border border-base-300 p-5 space-y-4">
        <h4 className="font-bold text-base-content flex items-center gap-2">
          <Edit3 className="w-5 h-5 text-indigo-600" />
          Edit Note
        </h4>

        <div>
          <label className="label text-sm font-medium text-base-content/80 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-600" />
            Title
          </label>

          <input
            name="title"
            value={editFormData.title}
            onChange={onChange}
            className="input input-bordered w-full bg-base-100 text-base-content focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
            required
          />
        </div>

        <div>
          <label className="label text-sm font-medium text-base-content/80 flex items-center gap-2">
            <NotebookPen className="w-4 h-4 text-indigo-600" />
            Description
          </label>

          <textarea
            name="description"
            value={editFormData.description}
            onChange={onChange}
            className="textarea textarea-bordered w-full bg-base-100 text-base-content focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
            rows={5}
            required
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onSave}
            disabled={isSaving}
            className={`btn btn-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 flex items-center gap-1 ${
              isSaving ? "opacity-70 cursor-not-allowed" : ""
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
                Save Changes
              </>
            )}
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onCancel}
            className="btn btn-sm btn-outline flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Cancel
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const NoteCard = ({
  note,
  index,
  editingNoteId,
  editFormData,
  onEditToggle,
  onEditChange,
  onEditSave,
  onDelete,
  isSaving,
}) => {
  const isEditing = editingNoteId === note._id;

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -6 }}
      className="group bg-base-100 border border-base-300 rounded-3xl shadow-lg hover:shadow-xl transition-all overflow-hidden"
    >
      <div className="h-36 bg-base-300 overflow-hidden relative">
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
            <ImageIcon className="w-12 h-12" />
          </div>
        )}

        <div className="absolute top-3 left-3 badge badge-primary">
          Note #{index + 1}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-base-content line-clamp-1">
              {note.title || "Untitled Note"}
            </h3>

            <p className="text-sm text-base-content/60 mt-1 flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {note.session?.title || "No Session Linked"}
            </p>

            <p className="text-xs text-base-content/50 mt-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(note.createdAt)}
            </p>
          </div>

          <div className="flex gap-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onEditToggle(note)}
              className="btn btn-sm btn-circle bg-blue-500 text-white border-0 hover:bg-blue-600"
              title="Edit note"
            >
              <Edit3 className="w-4 h-4" />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => onDelete(note._id)}
              className="btn btn-sm btn-circle bg-red-500 text-white border-0 hover:bg-red-600"
              title="Delete note"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <p className="text-sm text-base-content/75 mt-4 leading-relaxed line-clamp-4">
          {note.description || "No description"}
        </p>

        <AnimatePresence>
          {isEditing && (
            <EditNoteForm
              editFormData={editFormData}
              onChange={onEditChange}
              onSave={() => onEditSave(note._id)}
              onCancel={() => onEditToggle(note)}
              isSaving={isSaving}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
};

const MyNotes = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = UseAuth();

  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
  });

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

  const filteredNotes = useMemo(() => {
    let result = notes;

    if (filterSessionId) {
      result = result.filter((note) => note.sessionId === filterSessionId);
    }

    if (searchText.trim()) {
      const search = searchText.toLowerCase();

      result = result.filter((note) => {
        const title = note.title?.toLowerCase() || "";
        const description = note.description?.toLowerCase() || "";
        const sessionTitle = note.session?.title?.toLowerCase() || "";

        return (
          title.includes(search) ||
          description.includes(search) ||
          sessionTitle.includes(search)
        );
      });
    }

    return result;
  }, [notes, filterSessionId, searchText]);

  const selectedSessionTitle = useMemo(() => {
    if (!filterSessionId) return "All Sessions";

    const booking = bookings.find(
      (item) => getBookingSessionId(item) === filterSessionId
    );

    return booking?.session?.title || "Selected Session";
  }, [bookings, filterSessionId]);

  // Delete note
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/notes/${id}`);
      return res.data;
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Note removed successfully",
        customClass: {
          confirmButton:
            "btn btn-success bg-gradient-to-r from-green-500 to-emerald-600 text-white",
        },
        buttonsStyling: false,
        timer: 2000,
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
        buttonsStyling: false,
      });
    },
  });

  // Edit note
  const editMutation = useMutation({
    mutationFn: async ({ id, title, description }) => {
      const res = await axiosSecure.patch(`/notes/${id}`, {
        title,
        description,
      });

      return res.data;
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Note has been updated",
        customClass: {
          confirmButton:
            "btn btn-success bg-gradient-to-r from-green-500 to-emerald-600 text-white",
        },
        buttonsStyling: false,
        timer: 2000,
      });

      setEditingNoteId(null);
      setEditFormData({
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
        buttonsStyling: false,
      });
    },
  });

  const isEditingSaving = editMutation.isPending || editMutation.isLoading;

  const handleEditToggle = (note) => {
    if (editingNoteId === note._id) {
      setEditingNoteId(null);
      setEditFormData({
        title: "",
        description: "",
      });

      return;
    }

    setEditingNoteId(note._id);
    setEditFormData({
      title: note.title || "",
      description: note.description || "",
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;

    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = (id) => {
    const { title, description } = editFormData;

    if (!title || !description) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Please provide title and description",
        customClass: {
          confirmButton:
            "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white",
        },
        buttonsStyling: false,
      });

      return;
    }

    editMutation.mutate({
      id,
      title,
      description,
    });
  };

  const handleDeleteNote = async (id) => {
    const ans = await Swal.fire({
      title: "Delete note?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton:
          "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white mr-2",
        cancelButton: "btn btn-outline",
      },
      buttonsStyling: false,
    });

    if (ans.isConfirmed) {
      deleteMutation.mutate(id);
    }
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
            My Notes
          </h2>

          <p className="text-base-content/70 mt-3 text-lg max-w-2xl mx-auto">
            View, search, edit, and organize your notes from booked sessions.
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
          <StatCard icon={FileText} label="Total Notes" value={notes.length} />
          <StatCard
            icon={BookOpen}
            label="Booked Sessions"
            value={bookings.length}
          />
          <StatCard
            icon={Sparkles}
            label="Showing"
            value={filteredNotes.length}
            gradient
          />
        </div>

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
                Filter Notes
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
                    <option key={sessionId || `booking-${index}`} value={sessionId}>
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
                placeholder="Search by note title, description, or session..."
              />
            </div>
          </div>
        </motion.section>

        {/* Notes Library */}
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
                Notes Library
              </h3>

              <p className="text-base-content/60 mt-1">
                Manage your saved notes with edit and delete options.
              </p>
            </div>

            <span className="badge badge-primary badge-outline badge-lg w-fit">
              {filteredNotes.length} Note{filteredNotes.length !== 1 ? "s" : ""}
            </span>
          </div>

          {filteredNotes.length === 0 ? (
            <EmptyState
              title="No notes found"
              text={
                notes.length === 0
                  ? "You haven’t created any notes yet."
                  : "Try changing your search or session filter."
              }
            />
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredNotes.map((note, index) => (
                <NoteCard
                  key={note._id || `note-${index}`}
                  note={note}
                  index={index}
                  editingNoteId={editingNoteId}
                  editFormData={editFormData}
                  onEditToggle={handleEditToggle}
                  onEditChange={handleEditInputChange}
                  onEditSave={handleEditSubmit}
                  onDelete={handleDeleteNote}
                  isSaving={isEditingSaving}
                />
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default MyNotes;