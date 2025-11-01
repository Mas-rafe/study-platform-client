
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Edit, Trash, Loader2, AlertCircle, Image as ImageIcon, Filter } from "lucide-react";

const MyNotes = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = UseAuth();
  const queryClient = useQueryClient();
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editFormData, setEditFormData] = useState({ title: "", description: "" });
  const [filterSessionId, setFilterSessionId] = useState("");

  // Default placeholder image
  const placeholderImage = "https://via.placeholder.com/150?text=No+Image";

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
    queryKey: ["studentNotes", user?.email, filterSessionId],
    queryFn: async () => {
      if (!user?.email) return [];
      const res = await axiosSecure.get(`/notes/student/${user?.email}`);
      return filterSessionId
        ? res.data.filter((note) => note.sessionId === filterSessionId)
        : res.data;
    },
    enabled: !!user?.email,
  });

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
        customClass: { confirmButton: "btn btn-success bg-gradient-to-r from-green-500 to-emerald-600 text-white" },
        timer: 2000,
      });
      refetchNotes();
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.response?.data?.message || err.message,
        customClass: { confirmButton: "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white" },
      });
    },
  });

  // Edit note
  const editMutation = useMutation({
    mutationFn: async ({ id, title, description }) => {
      const res = await axiosSecure.patch(`/notes/${id}`, { title, description });
      return res.data;
    },
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "Note has been updated",
        customClass: { confirmButton: "btn btn-success bg-gradient-to-r from-green-500 to-emerald-600 text-white" },
        timer: 2000,
      });
      setEditingNoteId(null);
      setEditFormData({ title: "", description: "" });
      refetchNotes();
    },
    onError: (err) => {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.response?.data?.message || err.message,
        customClass: { confirmButton: "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white" },
      });
    },
  });

  // Handle edit form toggle
  const handleEditToggle = (note) => {
    if (editingNoteId === note._id) {
      setEditingNoteId(null);
      setEditFormData({ title: "", description: "" });
    } else {
      setEditingNoteId(note._id);
      setEditFormData({ title: note.title, description: note.description });
    }
  };

  // Handle edit form input change
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle edit form submission
  const handleEditSubmit = (id) => {
    const { title, description } = editFormData;
    if (!title || !description) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Please provide title and description",
        customClass: { confirmButton: "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white" },
      });
      return;
    }
    editMutation.mutate({ id, title, description });
  };

  // Handle delete note
  const handleDeleteNote = async (id) => {
    const ans = await Swal.fire({
      title: "Delete note?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonClass: "btn btn-error bg-gradient-to-r from-red-500 to-rose-600 text-white",
      cancelButtonClass: "btn btn-outline",
    });
    if (ans.isConfirmed) {
      deleteMutation.mutate(id);
    }
  };

  // Format date
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

  // Loading state
  if (bookingsLoading || notesLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-16 h-16 text-indigo-600" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* === HEADER === */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="relative"
        >
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 blur-3xl opacity-20 rounded-2xl"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
            📝 My Notes
          </h2>
          <p className="text-lg text-gray-600 mt-2">View and manage your notes for booked sessions</p>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "120px" }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full"
          />
        </motion.header>

        {/* === FILTER === */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100"
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Filter className="w-6 h-6 text-indigo-600" /> Filter Notes by Session
          </h3>
          <select
            value={filterSessionId}
            onChange={(e) => setFilterSessionId(e.target.value)}
            className="select select-bordered w-full bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
          >
            <option value="">All Sessions</option>
            {bookings.map((b) => (
              <option key={b.sessionId || b.session?._id} value={b.sessionId || b.session?._id}>
                {b.session?.title || "Untitled Session"}
              </option>
            ))}
          </select>
        </motion.section>

        {/* === NOTES LIST === */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" /> Your Notes
          </h3>
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">You haven’t created any notes yet.</p>
            </div>
          ) : (
            <div className="relative space-y-6">
              {/* Timeline Line */}
              <div className="absolute left-4 md:left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-500 to-purple-500"></div>
              {notes.map((note, idx) => (
                <motion.div
                  key={note._id || `note-${idx}`}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative pl-12"
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-2 md:left-4 top-4 w-4 h-4 bg-indigo-600 rounded-full border-2 border-white"></div>
                  <div className="bg-white rounded-lg shadow-md p-4 border border-indigo-100">
                    <div className="flex items-center gap-4">
                      {/* Session Image */}
                      {note.session?.image ? (
                        <img
                          src={note.session.image}
                          alt={note.session.title || "Session"}
                          className="w-16 h-16 rounded-md object-cover"
                          onError={(e) => (e.target.src = placeholderImage)}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{note.title || "Untitled Note"}</div>
                        <div className="text-sm text-gray-600">{note.session?.title || "No Session Linked"}</div>
                        <div className="text-sm text-gray-500 mt-1">{formatDate(note.createdAt)}</div>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditToggle(note)}
                          className="btn btn-sm bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" /> Edit
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteNote(note._id)}
                          className="btn btn-sm bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg flex items-center gap-1"
                        >
                          <Trash className="w-4 h-4" /> Delete
                        </motion.button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mt-2">{note.description || "No description"}</div>
                    {/* Edit Form */}
                    <AnimatePresence>
                      {editingNoteId === note._id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-4 space-y-4 border-t border-indigo-100 pt-4"
                        >
                          <div>
                            <label className="label flex items-center gap-2 text-sm font-medium text-gray-700">
                              <FileText className="w-4 h-4" /> Title
                            </label>
                            <input
                              name="title"
                              value={editFormData.title}
                              onChange={handleEditInputChange}
                              className="input input-bordered w-full bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                              required
                            />
                          </div>
                          <div>
                            <label className="label flex items-center gap-2 text-sm font-medium text-gray-700">
                              <FileText className="w-4 h-4" /> Description
                            </label>
                            <textarea
                              name="description"
                              value={editFormData.description}
                              onChange={handleEditInputChange}
                              className="textarea textarea-bordered w-full bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                              rows={4}
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEditSubmit(note._id)}
                              disabled={editMutation.isLoading}
                              className={`btn btn-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg flex items-center gap-1 ${
                                editMutation.isLoading ? "opacity-70 cursor-not-allowed" : ""
                              }`}
                            >
                              {editMutation.isLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                                </>
                              ) : (
                                <>
                                  <Edit className="w-4 h-4" /> Save Changes
                                </>
                              )}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleEditToggle(note)}
                              className="btn btn-sm btn-outline flex items-center gap-1"
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>
      </div>
    </div>
  );
};

export default MyNotes;
