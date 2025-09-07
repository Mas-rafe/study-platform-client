
import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";


import Swal from "sweetalert2";
import UseAuth from "../../Hooks/UseAuth";
import { Link,  useNavigate } from "react-router";
import { useForm } from "react-hook-form";


const Login = () => {
  const { signIn } = UseAuth();
  const { register, handleSubmit } = useForm();
  const [showPass, setShowPass] = useState(false);
  const navigate = useNavigate ();

  const onSubmit = (data) => {
    signIn(data.email, data.password)
      .then(() => {
        Swal.fire("Success!", "Logged in successfully", "success");
        navigate("/");
      })
      .catch((err) => {
        Swal.fire("Error", err.message, "error");
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card w-full max-w-md shadow-2xl bg-base-100">
        <form onSubmit={handleSubmit(onSubmit)} className="card-body space-y-4">
          <h2 className="text-2xl font-bold text-center">Login</h2>

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

          <button className="btn btn-primary w-full">Login</button>

          {/* Social login component */}
          {/* <SocialLogin /> */}

          <p className="text-center">
            Don’t have an account?{" "}
            <Link to="/register" className="link link-primary">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
