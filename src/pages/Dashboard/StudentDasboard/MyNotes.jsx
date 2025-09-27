import React from "react";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";

const MyNotes = () => {
  const axiosSecure = useAxiosSecure();
  const { user, email } = UseAuth();

  const {
    data: notes = [],
    isLoading: notesLoading,
    refetch: refetchNotes,
  } = useQuery({
    queryKey: ["studentNotes", email],
    queryFn: async () => {
      const res = await axiosSecure.get(`/notes/student/${email}`);
      return res.data;
    },
    enabled: !!email,
  });

  // --- Delete note
  const handleDeleteNote = async (id) => {
    const ans = await Swal.fire({
      title: "Delete note?",
      showCancelButton: true,
      icon: "warning",
    });
    if (!ans.isConfirmed) return;
    try {
      await axiosSecure.delete(`/notes/${id}`);
      Swal.fire("Deleted", "Note removed", "success");
      refetchNotes();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  // --- Edit note
  const handleEditNote = async (note) => {
    const { value: formValues } = await Swal.fire({
      title: "Edit Note",
      html: `
        <input id="swal-title" class="swal2-input" placeholder="Title" value="${note.title}" />
        <textarea id="swal-description" class="swal2-textarea" placeholder="Description">${note.description}</textarea>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const title = document.getElementById("swal-title").value;
        const description = document.getElementById("swal-description").value;
        if (!title || !description) {
          Swal.showValidationMessage("Both fields are required");
          return false;
        }
        return { title, description };
      },
    });

    if (!formValues) return;

    try {
      await axiosSecure.patch(`/notes/${note._id}`, formValues);
      Swal.fire("Updated!", "Note has been updated.", "success");
      refetchNotes();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || err.message, "error");
    }
  };

  return (
    <section
      id="my-notes-section"
      className="bg-white p-4 rounded-xl shadow"
    >
      <h2 className="text-xl font-semibold mb-2">My Notes</h2>
      {notes.length === 0 ? (
        <p className="text-gray-500">You have no notes.</p>
      ) : (
        <div className="grid gap-3">
          {notes.map((n) => (
            <div
              key={n._id}
              className="border p-3 rounded flex justify-between items-start"
            >
              <div>
                <div className="font-semibold">{n.title}</div>
                <div className="text-sm text-gray-600">{n.description}</div>
                <div className="text-xs text-gray-400 mt-2">
                  Created: {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => handleEditNote(n)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => handleDeleteNote(n._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default MyNotes;
