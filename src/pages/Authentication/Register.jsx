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
      const result = await createUser(data.email, data.password);

      await updateUserProfile({
        displayName: data.name,
        photoURL: data.photo,
      });

      // ✅ Save user to DB
      await axios.post("https://study-platform-server-ruddy.vercel.app/users", {
        name: data.name,
        email: data.email,
        photo: data.photo,
      });

      // ✅ Get JWT token
      const res = await axios.post("https://study-platform-server-ruddy.vercel.app/jwt", {
        email: data.email,
      });
      localStorage.setItem("access-token", res.data.token);

      Swal.fire("Success!", "Account created successfully", "success");
      navigate("/");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md shadow-2xl bg-base-100">
        <form onSubmit={handleSubmit(onSubmit)} className="card-body space-y-4">
          <h2 className="text-2xl font-bold text-center">Register</h2>

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

          <div>
            <label className="label">Photo URL</label>
            <input
              type="text"
              {...register("photo")}
              placeholder="Photo URL"
              className="input input-bordered w-full"
            />
          </div>

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
          {/* Social login component */}
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
