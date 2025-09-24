import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";

const ManageMaterials = () => {
  const axiosSecure = useAxiosSecure();
  const [tab, setTab] = useState("pending"); // 'pending' or 'all'

  // Fetch Pending Materials
  const {
    data: pendingMaterials = [],
    refetch: refetchPending,
  } = useQuery({
    queryKey: ["pendingMaterials"],
    queryFn: async () => {
      const res = await axiosSecure.get("/materials/pending");
      return res.data;
    },
  });

  // Fetch All Materials
  const {
    data: allMaterials = [],
    refetch: refetchAll,
  } = useQuery({
    queryKey: ["allMaterials"],
    queryFn: async () => {
      const res = await axiosSecure.get("/materials");
      return res.data;
    },
  });

  const handleApprove = async (id) => {
    try {
      const res = await axiosSecure.patch(`/materials/${id}/approve`);
      if (res.data.success) {
        Swal.fire("✅ Approved", res.data.message, "success");
        refetchPending();
        refetchAll();
      }
    } catch (error) {
      console.error(error);
      Swal.fire("❌ Error", "Failed to approve material", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      const res = await axiosSecure.patch(`/materials/${id}/reject`);
      if (res.data.success) {
        Swal.fire("❌ Rejected", res.data.message, "success");
        refetchPending();
        refetchAll();
      }
    } catch (error) {
      console.error(error);
      Swal.fire("❌ Error", "Failed to reject material", "error");
    }
  };

  const renderMaterials = (materials) => (
    <div className="overflow-x-auto">
      <table className="table table-zebra w-full">
        <thead>
          <tr>
            <th>#</th>
            <th>Session ID</th>
            <th>Title</th>
            <th>Tutor Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((m, index) => (
            <tr key={m._id}>
              <th>{index + 1}</th>
              <td>{m.sessionId}</td>
              <td>{m.title}</td>
              <td>{m.tutorEmail}</td>
              <td className="capitalize">{m.status}</td>
              <td className="space-x-2">
                {tab === "pending" && (
                  <>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => handleApprove(m._id)}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-sm btn-error"
                      onClick={() => handleReject(m._id)}
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  className="btn btn-sm btn-info"
                  onClick={() =>
                    window.open(m.fileUrl, "_blank", "noopener,noreferrer")
                  }
                >
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Manage Study Materials</h2>

      {/* Tabs */}
      <div className="tabs mb-4">
        <button
          className={`tab tab-bordered ${tab === "pending" && "tab-active"}`}
          onClick={() => setTab("pending")}
        >
          Pending Materials
        </button>
        <button
          className={`tab tab-bordered ${tab === "all" && "tab-active"}`}
          onClick={() => setTab("all")}
        >
          All Materials
        </button>
      </div>

      {/* Materials Table */}
      {tab === "pending"
        ? renderMaterials(pendingMaterials)
        : renderMaterials(allMaterials)}
    </div>
  );
};

export default ManageMaterials;
