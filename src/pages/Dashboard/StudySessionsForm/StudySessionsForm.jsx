import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import useAxiosSecure from "../../../Hooks/UseAxiosSecure";
import UseAuth from "../../../Hooks/UseAuth";

const StudySessionsForm = () => {
  const { register, handleSubmit, reset } = useForm();
  const axiosSecure = useAxiosSecure();
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
      <h2 className="text-2xl font-bold mb-6">Create Study Session</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div>
          <label className="label font-semibold">Session Title</label>
          <input
            {...register("title", { required: true })}
            placeholder="Enter session title"
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label className="label font-semibold">Subject</label>
          <input
            {...register("subject", { required: true })}
            placeholder="Enter subject"
            className="input input-bordered w-full"
          />
        </div>

        <div>
          <label className="label font-semibold">Description</label>
          <textarea
            {...register("description")}
            placeholder="Describe the session content"
            className="textarea textarea-bordered w-full"
          />
        </div>

        {/* Schedule */}
        <div>
          <h3 className="font-semibold mb-2">Schedule</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Registration Start Date</label>
              <input
                type="date"
                {...register("registrationStart", { required: true })}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">Registration End Date</label>
              <input
                type="date"
                {...register("registrationEnd", { required: true })}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">Class Start Date</label>
              <input
                type="date"
                {...register("classStart", { required: true })}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">Class Start Time</label>
              <input
                type="time"
                {...register("classStartTime", { required: true })}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">Class End Date</label>
              <input
                type="date"
                {...register("classEnd", { required: true })}
                className="input input-bordered w-full"
              />
            </div>
          </div>
        </div>

        {/* Duration & Fee */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Duration (hours)</label>
            <input
              type="number"
              {...register("duration", { required: true, min: 1 })}
              placeholder="e.g. 2"
              className="input input-bordered w-full"
            />
          </div>

          <div>
            <label className="label">Registration Fee ($)</label>
            <input
              type="number"
              {...register("registrationFee", { required: true, min: 0 })}
              placeholder="0 = Free"
              className="input input-bordered w-full"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary w-full mt-4">
          Create Session
        </button>
      </form>
    </div>
  );
};

export default StudySessionsForm;
