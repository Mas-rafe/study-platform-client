import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";

const ManageReviews = () => {
  const axiosSecure = useAxiosSecure();

  // Fetch all reviews (admin only)
  const { data: reviews = [], refetch, isLoading, isError, error } = useQuery({
    queryKey: ["all-reviews"],
    queryFn: async () => {
      const res = await axiosSecure.get("/reviews"); // JWT sent automatically
      return res.data;
    },
    retry: false,
  });

  if (isLoading) return <p className="text-center mt-10">Loading reviews...</p>;
  if (isError) {
    return (
      <p className="text-center text-red-500 mt-10">
        {error?.response?.data?.message || "Failed to load reviews. Are you an admin?"}
      </p>
    );
  }

  // Delete review
  const handleDelete = async (id) => {
  const confirm = await Swal.fire({
    title: "Are you sure?",
    text: "This will permanently delete the review.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (confirm.isConfirmed) {
    try {
      const res = await axiosSecure.delete(`/reviews/${id}`);
      // Check deletedCount instead of success
    if (res.data?.deletedCount && res.data.deletedCount > 0) {
  Swal.fire("Deleted!", "Review has been deleted.", "success");
  refetch();
} else {
  Swal.fire("Error!", "Failed to delete the review.", "error");
}
    } catch (err) {
      Swal.fire(
        "Error!",
        err.response?.data?.message || err.message || "Something went wrong",
        "error"
      );
    }
  }
};


  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Manage Reviews</h2>

      {reviews.length === 0 ? (
        <p className="text-center text-gray-500">No reviews available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Session ID</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, idx) => (
                <tr key={review._id} className="hover">
                  <td>{idx + 1}</td>
                  <td>
                    {review.studentName}
                    <br />
                    <small className="text-gray-500">{review.studentEmail}</small>
                  </td>
                  <td className="text-sm">{review.sessionId}</td>
                  <td>{review.rating} ⭐</td>
                  <td className="max-w-xs truncate">{review.comment}</td>
                  <td>{new Date(review.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(review._id)}
                      className="btn btn-error btn-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageReviews;
