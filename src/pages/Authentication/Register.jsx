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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const navigate = useNavigate();
  const password = watch("password");

  const imageUploadUrl = `https://api.imgbb.com/1/upload?key=${
    import.meta.env.VITE_IMGBB_API_KEY
  }`;

  const onSubmit = async (data) => {
    try {
      // Extra safety check
      if (data.password !== data.confirmPassword) {
        Swal.fire("Error", "Passwords do not match", "error");
        return;
      }

      let uploadedPhotoUrl = "";

      // Upload photo to ImgBB if user selects a photo
      if (data.photo && data.photo[0]) {
        const imageFile = data.photo[0];
        const formData = new FormData();
        formData.append("image", imageFile);

        const imageRes = await axios.post(imageUploadUrl, formData);

        if (imageRes.data?.success) {
          uploadedPhotoUrl = imageRes.data.data.display_url;
        }
      }

      // 1. Create Firebase user
      await createUser(data.email, data.password);

      // 2. Update Firebase profile
      await updateUserProfile({
        displayName: data.name,
        photoURL: uploadedPhotoUrl,
      });

      // 3. Save user in MongoDB
      await axios.post(
        "https://study-platform-server-ruddy.vercel.app/users",
        {
          name: data.name,
          email: data.email,
          photo: uploadedPhotoUrl,
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

      // 5. Fetch actual user role from DB
      const userRes = await axios.get(
        `https://study-platform-server-ruddy.vercel.app/users/${data.email}`
      );

      const userRole = userRes.data?.role || "student";

      // Store role globally for dashboard routing
      localStorage.setItem("user-role", userRole);

      Swal.fire("Success!", "Account created successfully", "success");

      // 6. Redirect based on role
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
    <div className="w-full min-h-[100dvh] bg-base-200 px-4 py-8 sm:py-10">
      <div className="flex justify-center">
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

            {/* Photo Upload */}
            <div>
              <label className="label">Upload Photo</label>
              <input
                type="file"
                accept="image/*"
                {...register("photo")}
                className="file-input file-input-bordered w-full"
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
              <label className="label">
                Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                      message:
                        "Password must include uppercase, lowercase, and number",
                    },
                  })}
                  placeholder="Enter your password"
                  className="input input-bordered w-full pr-10"
                />

                <span
                  className="absolute top-3 right-3 cursor-pointer"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">
                Confirm Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <input
                  type={showConfirmPass ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Confirm password is required",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  placeholder="Confirm your password"
                  className="input input-bordered w-full pr-10"
                />

                <span
                  className="absolute top-3 right-3 cursor-pointer"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
                >
                  {showConfirmPass ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>

              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
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
    </div>
  );
};

export default Register;