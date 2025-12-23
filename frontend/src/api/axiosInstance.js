import axios from 'axios';

const baseURL = process.env.REACT_APP_BACKEND_URL

const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
  withCredentials: true,
});

export default axiosInstance;