import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

const ManageUsers = () => {
  const axiosSecure = useAxiosSecure();
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch users with search
  const { data: users = [], refetch } = useQuery({
    queryKey: ["users", searchTerm],
    queryFn: async () => {
      const url = searchTerm ? `/users?search=${searchTerm}` : "/users";
      const res = await axiosSecure.get(url);
      return res.data;
    },
  });

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await axiosSecure.patch(`/users/${userId}/role`, { role: newRole });
      if (res.data.modifiedCount > 0) {
        Swal.fire({
          title: "Success!",
          text: `User is now a ${newRole}`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        refetch();
      }
    } catch (err) {
      Swal.fire("Error!", "Failed to update role", "error");
    }
  };

  const handleDelete = async (user) => {
    const result = await Swal.fire({
      title: "Delete User?",
      text: `This will permanently delete ${user.name}`,
      icon: "warning",
      showCancelButton: true,
      dangerMode: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      customClass: {
        confirmButton: "btn btn-error",
        cancelButton: "btn btn-ghost",
      },
    });

    if (result.isConfirmed) {
      try {
        const res = await axiosSecure.delete(`/users/${user._id}`);
        if (res.data.deletedCount > 0) {
          Swal.fire("Deleted!", `${user.name} has been removed.`, "success");
          refetch();
        }
      } catch (err) {
        Swal.fire("Error!", "Failed to delete user.", "error");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 mt-6 px-4">
      <div className="max-w-7xl mx-auto">

        {/* === HEADING & SEARCH === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Manage Users
              </h2>
              <p className="text-gray-600 mt-1">Control user roles and access</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-primary badge-lg font-medium">{users.length} Total</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            {/* Full Width Input */}
            <input
              type="text"
              placeholder="Search by name or email..."
              className="input input-bordered input-primary w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Gradient Button */}
            <button
              onClick={refetch}
              className="btn btn-md rounded-lg shadow-md hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white border-0"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search
            </button>
          </div>
        </motion.div>

        {/* === USERS TABLE === */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {users.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Top Scroll Indicator */}
              <div className="flex justify-end p-1 bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="w-16 h-1 bg-indigo-300 rounded-full animate-pulse"></div>
              </div>

              <table className="table w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                    <th className="text-left">#</th>
                    <th className="text-left">Name</th>
                    <th className="text-left">Email</th>
                    <th className="text-center">Role</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <motion.tr
                      key={user._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="hover:bg-indigo-50 transition-all duration-200 border-b"
                    >
                      <td className="font-medium text-gray-700">{idx + 1}</td>

                      {/* === USER NAME + PROFILE PIC === */}
                      <td>
                        <div className="flex items-center gap-3">
                          {/* Profile Picture */}
                          {user.photo ? (
                            <div className="avatar">
                              <div className="mask mask-circle w-10 h-10 ring ring-primary ring-offset-base-100 ring-offset-2">
                                <img
                                  src={user.photo}
                                  alt={user.name}
                                  className="object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=6366f1&color=fff&bold=true`;
                                  }}
                                />
                              </div>
                            </div>
                          ) : (
                            /* Fallback Avatar */
                            <div className="avatar placeholder">
                              <div className="mask mask-circle w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center">
                                <span className="text-sm">
                                  {user.name?.charAt(0).toUpperCase() || "U"}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Name */}
                          <span className="font-semibold text-gray-800">{user.name || "Unnamed"}</span>
                        </div>
                      </td>

                      {/* === EMAIL === */}
                      <td>
                        <p className="font-medium text-gray-700">{user.email}</p>
                      </td>

                      {/* === ROLE === */}
                      <td className="text-center">
                        <span
                          className={`badge badge-lg font-medium ${user.role === "admin"
                              ? "badge-error"
                              : user.role === "tutor"
                                ? "badge-warning"
                                : "badge-success"
                            }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* === ACTIONS === */}
                      <td className="text-center">
                        <div className="flex gap-1 justify-center flex-wrap">
                          {user.role !== "admin" && (
                            <>
                              {user.role !== "student" && (
                                <button
                                  onClick={() => handleRoleChange(user._id, "student")}
                                  className="btn btn-success btn-xs rounded-lg"
                                >
                                  Student
                                </button>
                              )}
                              {user.role !== "tutor" && (
                                <button
                                  onClick={() => handleRoleChange(user._id, "tutor")}
                                  className="btn btn-warning btn-xs rounded-lg text-white"
                                >
                                  Tutor
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(user)}
                                className="btn btn-error btn-xs rounded-lg"
                              >
                                Delete
                              </button>
                            </>
                          )}
                          {user.role === "admin" && (
                            <span className="text-xs text-gray-400 italic">Protected</span>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* Bottom Scroll Indicator */}
              <div className="flex justify-start p-1 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="w-16 h-1 bg-purple-300 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ManageUsers;