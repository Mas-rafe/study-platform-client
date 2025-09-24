import { useQuery } from "@tanstack/react-query";
import Swal from "sweetalert2";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";

const ManageReviews = () => {
  const axiosSecure = useAxiosSecure();

  // fetch all reviews
  const {
    data: reviews = [],
    refetch,
    isLoading,
  } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const res = await axiosSecure.get("/reviews");
      return res.data;
    },
  });

  if (isLoading) return <p className="text-center mt-10">Loading reviews...</p>;

  // delete review
  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the review.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete!",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await axiosSecure.delete(`/reviews/${id}`);
        if (res.data.success) {
          Swal.fire("Deleted!", "Review has been deleted.", "success");
          refetch();
        }
      } catch (err) {
        Swal.fire("Error!", err.message || "Something went wrong", "error");
      }
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-4">Manage Reviews</h2>

      {reviews.length === 0 ? (
        <p className="text-center text-gray-500">No reviews available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="table w-full table-auto border">
            <thead className="bg-gray-100">
              <tr>
                <th>#</th>
                <th>Reviewer</th>
                <th>Session</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, idx) => (
                <tr key={review._id}>
                  <td>{idx + 1}</td>
                  <td>{review.reviewerName} <br /> <small>{review.reviewerEmail}</small></td>
                  <td>{review.sessionTitle}</td>
                  <td>{review.rating} ⭐</td>
                  <td>{review.comment}</td>
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
