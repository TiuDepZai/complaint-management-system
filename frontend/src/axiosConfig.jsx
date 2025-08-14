import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:5001', // local commit check again
  baseURL: 'http://3.26.65.33:5001', // live changed once again for another commit once again
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
