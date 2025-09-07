import axios from 'axios';

import UseAuth from './UseAuth';

const axiosSecure = axios.create({
    baseURL:`http://localhost:5000`
});

const useAxiosSecure = () => {
    const { user } = UseAuth();

    axiosSecure.interceptors.request.use(config => {
        config.headers.Authorization = `Bearer ${user.accessToken}`
        return config;
    },error =>{
        return Promise.reject(error);
    })
    return axiosSecure;
};

export default useAxiosSecure;
