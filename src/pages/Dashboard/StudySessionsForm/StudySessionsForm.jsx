
import Swal from "sweetalert2";


import { useForm } from "react-hook-form";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";

const StudySessionsForm = () => {
  const { register, handleSubmit, reset } = useForm();
  const axiosSecure = useAxiosSecure()
  const { user } = UseAuth();

  const onSubmit = async (data) => {
    try {
      const sessionData = {
        ...data,
        tutorName: user?.displayName,
        tutorEmail: user?.email,
        createdAt: new Date(),
      };

      const res = await axiosSecure.post("/sessions", sessionData);
      if (res.data.insertedId) {
        Swal.fire({
          icon: "success",
          title: "Session Created!",
          text: "Your study session is now live.",
        });
        reset();
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Failed to create session",
        text: err.message,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-base-200 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Create Study Session</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input {...register("title", { required: true })} placeholder="Session Title" className="input input-bordered w-full" />
        <input {...register("subject", { required: true })} placeholder="Subject" className="input input-bordered w-full" />
        <textarea {...register("description")} placeholder="Description" className="textarea textarea-bordered w-full" />
        <input type="date" {...register("date", { required: true })} className="input input-bordered w-full" />
        <input type="time" {...register("time", { required: true })} className="input input-bordered w-full" />
        <input type="number" {...register("duration", { required: true })} placeholder="Duration (hours)" className="input input-bordered w-full" />

        <button type="submit" className="btn btn-primary w-full">Create Session</button>
      </form>
    </div>
  );
};

export default StudySessionsForm;
