import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import { motion } from "framer-motion";
import { FileText, CheckCircle, XCircle, Eye, Clock, AlertCircle } from "lucide-react";

const ManageMaterials = () => {
  const axiosSecure = useAxiosSecure();
  const [tab, setTab] = useState("pending");

  const {
    data: pendingMaterials = [],
    refetch: refetchPending,
    isLoading: loadingPending,
  } = useQuery({
    queryKey: ["pendingMaterials"],
    queryFn: async () => {
      const res = await axiosSecure.get("/materials/pending");
      return res.data;
    },
  });

  const {
    data: allMaterials = [],
    refetch: refetchAll,
    isLoading: loadingAll,
  } = useQuery({
    queryKey: ["allMaterials"],
    queryFn: async () => {
      const res = await axiosSecure.get("/materials");
      return res.data;
    },
  });

  const handleApprove = async (id) => {
    const result = await Swal.fire({
      title: "Approve Material?",
      text: "This will make it available to students.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Approve",
      cancelButtonText: "Cancel",
      customClass: { confirmButton: "btn btn-success", cancelButton: "btn btn-ghost" },
    });

    if (result.isConfirmed) {
      try {
        const res = await axiosSecure.patch(`/materials/${id}/approve`);
        if (res.data.success) {
          Swal.fire("Approved!", "Material is now live.", "success");
          refetchPending();
          refetchAll();
        }
      } catch (error) {
        console.error("Approve error:", error);
        Swal.fire("Error", error.response?.data?.message || "Failed to approve", "error");
      }
    }
  };

  const handleReject = async (id) => {
    const result = await Swal.fire({
      title: "Reject Material?",
      text: "This will remove it from pending.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Reject",
      cancelButtonText: "Cancel",
      customClass: { confirmButton: "btn btn-error", cancelButton: "btn btn-ghost" },
    });

    if (result.isConfirmed) {
      try {
        const res = await axiosSecure.patch(`/materials/${id}/reject`);
        if (res.data.success) {
          Swal.fire("Rejected!", "Material has been removed.", "success");
          refetchPending();
          refetchAll();
        }
      } catch (error) {
        console.error("Reject error:", error);
        Swal.fire("Error", error.response?.data?.message || "Failed to reject", "error");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return (
          <span className="badge badge-warning badge-lg font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case "approved":
        return (
          <span className="badge badge-success badge-lg font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Approved
          </span>
        );
      case "rejected":
        return (
          <span className="badge badge-error badge-lg font-medium flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return <span className="badge badge-ghost">{status}</span>;
    }
  };

  const renderMaterials = (materials, isLoading) => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-16">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      );
    }

    if (materials.length === 0) {
      return (
        <div className="text-center py-16">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No materials found.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <div className="flex justify-end p-1 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="w-16 h-1 bg-indigo-300 rounded-full animate-pulse"></div>
        </div>

        <table className="table w-full">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <th className="text-left">#</th>
              <th className="text-left">Session ID</th>
              <th className="text-left">Title</th>
              <th className="text-left">Tutor</th>
              <th className="text-center">Status</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((m, index) => (
              <motion.tr
                key={m._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-indigo-50 transition-all duration-200 border-b"
              >
                <td className="font-medium text-gray-700">{index + 1}</td>
                <td>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{m.sessionId}</code>
                </td>
                <td>
                  <p className="font-semibold text-gray-800 max-w-xs truncate" title={m.title}>
                    {m.title}
                  </p>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <div className="avatar placeholder">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center">
                        {m.tutorEmail?.[0]?.toUpperCase() || "T"}
                      </div>
                    </div>
                    <span className="text-sm text-gray-700">{m.tutorEmail}</span>
                  </div>
                </td>
                <td className="text-center">{getStatusBadge(m.status)}</td>
                <td className="text-center">
                  <div className="flex gap-1 justify-center flex-wrap">
                    {tab === "pending" && (
                      <>
                        <button
                          onClick={() => handleApprove(m._id)}
                          className="btn btn-success btn-xs rounded-lg flex items-center gap-1"
                          title="Approve"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReject(m._id)}
                          className="btn btn-error btn-xs rounded-lg flex items-center gap-1"
                          title="Reject"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => window.open(m.fileUrl, "_blank", "noopener,noreferrer")}
                      className="btn btn-info btn-xs rounded-lg flex items-center gap-1 text-white"
                      title="View File"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-start p-1 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="w-16 h-1 bg-purple-300 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Manage Study Materials
              </h2>
              <p className="text-gray-600 mt-1">Approve, reject, and monitor uploaded files</p>
            </div>
            <div className="flex gap-2">
              <span className="badge badge-warning badge-lg font-medium">
                {pendingMaterials.length} Pending
              </span>
              <span className="badge badge-success badge-lg font-medium">
                {allMaterials.filter(m => m.status === "approved").length} Approved
              </span>
            </div>
          </div>

          <div className="flex gap-1 mt-6 border-b border-gray-200">
            {["pending", "all"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3 font-medium text-sm capitalize transition-all rounded-t-lg ${
                  tab === t
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {t === "pending" ? "Pending Materials" : "All Materials"}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {tab === "pending"
            ? renderMaterials(pendingMaterials, loadingPending)
            : renderMaterials(allMaterials, loadingAll)}
        </motion.div>
      </div>
    </div>
  );
};

export default ManageMaterials;