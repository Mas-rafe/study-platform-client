import axios from "axios";

const axiosSecure = axios.create({
  baseURL: "http://localhost:5000",
});

// Interceptor → শুধু একবার set হবে
axiosSecure.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const useAxiosSecure = () => {
  return axiosSecure;
};

export default useAxiosSecure;
