import axios from "axios";

const axiosSecure = axios.create({
  baseURL: 'https://study-platform-server-ruddy.vercel.app'
});

// Automatically attach JWT token
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

// Optional: handle 401/403 globally
axiosSecure.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // token invalid or user not authorized
      console.error("Unauthorized access - maybe log out the user");
    }
    return Promise.reject(error);
  }
);

const useAxiosSecure = () => axiosSecure;

export default useAxiosSecure;
