import axios from "axios";



const axiosInstance = axios.create({
    baseURL:`https://study-platform-server-ruddy.vercel.app`
})


const UseAxios = () => {
  return axiosInstance;
}

export default UseAxios;