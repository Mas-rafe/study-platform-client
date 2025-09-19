import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import Swal from "sweetalert2";

const ManageUsers = () => {
  const axiosSecure = useAxiosSecure();
  const [searchTerm, setSearchTerm] = useState("");

  // fetch users with optional search
 const { data: users = [], refetch } = useQuery({
  queryKey: ["users", searchTerm],
  queryFn: async () => {
    const url = searchTerm
      ? `/users?search=${searchTerm}`
      : "/users";
    const res = await axiosSecure.get(url);
    return res.data;
  },
});


  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await axiosSecure.patch(`/users/${userId}/role`, { role: newRole });
      if (res.data.modifiedCount > 0) {
        Swal.fire("Success!", "User role updated successfully", "success");
        refetch();
      }
    } catch (err) {
      Swal.fire("Error!", "Failed to update user role", "error");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Users</h2>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name or email"
          className="input input-bordered w-full max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button
          className="btn btn-primary ml-2"
          onClick={refetch}
        >
          Search
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <tr key={user._id}>
                <td>{idx + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td className="flex gap-2">
                  {user.role !== "admin" && (
                    <>
                      {user.role !== "student" && (
                        <button
                          className="btn btn-sm btn-success"
                          onClick={() => handleRoleChange(user._id, "student")}
                        >
                          Make Student
                        </button>
                      )}
                      {user.role !== "tutor" && (
                        <button
                          className="btn btn-sm btn-warning"
                          onClick={() => handleRoleChange(user._id, "tutor")}
                        >
                          Make Tutor
                        </button>
                      )}
                    </>
                  )}
                  {user.role !== "admin" && (
                    <button
                      className="btn btn-sm btn-error"
                      onClick={async () => {
                        const confirm = await Swal.fire({
                          title: "Are you sure?",
                          text: `Delete user ${user.name}?`,
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonText: "Yes, delete!",
                        });
                        if (confirm.isConfirmed) {
                          const res = await axiosSecure.delete(`/users/${user._id}`);
                          if (res.data.deletedCount > 0) {
                            Swal.fire("Deleted!", "User has been deleted.", "success");
                            refetch();
                          }
                        }
                      }}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ManageUsers;
