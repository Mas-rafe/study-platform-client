// import React, { useState } from "react";
// import Swal from "sweetalert2";
// import useAxiosSecure from "../../Hooks/UseAxiosSecure";


// const StudentReview = ({ sessionId, studentEmail, onReviewAdded }) => {
//     const axiosSecure = useAxiosSecure();
//     const [rating, setRating] = useState(5);
//     const [comment, setComment] = useState("");
//     const [loading, setLoading] = useState(false);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!sessionId || !studentEmail) {
//             return Swal.fire("Error", "Session or user not found", "error");
//         }

//         if (!rating || rating < 1 || rating > 5) {
//             return Swal.fire("Error", "Rating must be between 1 and 5", "error");
//         }

//         setLoading(true);
//         try {
//             const res = await axiosSecure.post("/reviews", {
//                 sessionId: sessionId,           // from props
//                 studentEmail: studentEmail,     // from props
//                 studentName: "Anonymous",       // or pass as prop if you want
//                 comment,
//                 rating,
//             });


//             if (res.data.success) {
//                 Swal.fire("Success", "Review added successfully!", "success");
//                 setRating(5);
//                 setComment("");
//                 if (onReviewAdded) onReviewAdded(); // callback to refresh reviews
//             } else {
//                 Swal.fire("Oops!", res.data.message || "Failed to add review", "error");
//             }
//         } catch (err) {
//             Swal.fire("Error", err.response?.data?.message || err.message, "error");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="p-4 border rounded-lg shadow-md mt-4">
//             <h3 className="text-lg font-semibold mb-2">Add Your Review</h3>
//             <form onSubmit={handleSubmit} className="flex flex-col gap-2">
//                 <label>
//                     Rating:
//                     <select
//                         value={rating}
//                         onChange={(e) => setRating(Number(e.target.value))}
//                         className="ml-2 border rounded px-2 py-1"
//                     >
//                         {[5, 4, 3, 2, 1].map((r) => (
//                             <option key={r} value={r}>
//                                 {r} ⭐
//                             </option>
//                         ))}
//                     </select>
//                 </label>

//                 <label>
//                     Comment:
//                     <textarea
//                         value={comment}
//                         onChange={(e) => setComment(e.target.value)}
//                         className="w-full border rounded p-2 mt-1"
//                         placeholder="Write your review here..."
//                         rows={3}
//                     />
//                 </label>

//                 <button
//                     type="submit"
//                     className={`btn btn-primary mt-2 ${loading ? "loading" : ""}`}
//                     disabled={loading}
//                 >
//                     {loading ? "Submitting..." : "Submit Review"}
//                 </button>
//             </form>
//         </div>
//     );
// };

// export default StudentReview;
