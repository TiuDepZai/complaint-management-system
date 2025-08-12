import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL: 'http://localhost:5001', // local
  baseURL: 'http://3.26.170.65:5001', // live changed once again for commit
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
