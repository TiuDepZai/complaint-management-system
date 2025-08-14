import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // local
  // baseURL: 'http://3.25.144.206:5001', // live changed once again for another commit once again
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
