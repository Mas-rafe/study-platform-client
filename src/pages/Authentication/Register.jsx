import { useState } from "react";
import Swal from "sweetalert2";
import UseAuth from "../../Hooks/UseAuth";
import { Link, useNavigate } from "react-router";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useForm } from "react-hook-form";
import axios from "axios";
import SocialLogin from "./SocialLogin";

const Register = () => {
  const { createUser, updateUserProfile } = UseAuth();
  const { register, handleSubmit } = useForm();
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      // 1. Create Firebase user
      await createUser(data.email, data.password);

      // 2. Update Firebase profile
      await updateUserProfile({
        displayName: data.name,
        photoURL: data.photo,
      });

      // 3. Save user in MongoDB (role still sent, but backend controls final authority)
      await axios.post(
        "https://study-platform-server-ruddy.vercel.app/users",
        {
          name: data.name,
          email: data.email,
          photo: data.photo,
          role: data.role || "student",
        }
      );

      // 4. Get JWT token
      const res = await axios.post(
        "https://study-platform-server-ruddy.vercel.app/jwt",
        {
          email: data.email,
        }
      );

      localStorage.setItem("access-token", res.data.token);

      // 5. IMPORTANT FIX: Fetch actual user role from DB
      const userRes = await axios.get(
        `https://study-platform-server-ruddy.vercel.app/users/${data.email}`
      );

      const userRole = userRes.data?.role || "student";

      // store role globally for dashboard routing
      localStorage.setItem("user-role", userRole);

      Swal.fire("Success!", "Account created successfully", "success");

      // 6. Redirect based on role (fixes wrong dashboard issue)
      if (userRole === "tutor") {
        navigate("/dashboard/tutor");
      } else {
        navigate("/dashboard/student");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md shadow-2xl bg-base-100">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="card-body space-y-4"
        >
          <h2 className="text-2xl font-bold text-center">Register</h2>

          {/* Name */}
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              {...register("name")}
              placeholder="Enter your name"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Photo */}
          <div>
            <label className="label">Photo URL</label>
            <input
              type="text"
              {...register("photo")}
              placeholder="Photo URL"
              className="input input-bordered w-full"
            />
          </div>

          {/* Email */}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              {...register("email")}
              placeholder="Enter your email"
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label className="label">Select Role</label>
            <select
              {...register("role")}
              className="select select-bordered w-full"
              required
            >
              <option value="">Select your role</option>
              <option value="student">Student</option>
              <option value="tutor">Tutor</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                {...register("password")}
                placeholder="Enter your password"
                className="input input-bordered w-full"
                required
              />
              <span
                className="absolute top-3 right-3 cursor-pointer"
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button className="btn btn-primary w-full">Register</button>

          <SocialLogin />

          <p className="text-center">
            Already have an account?{" "}
            <Link to="/login" className="link link-primary">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;