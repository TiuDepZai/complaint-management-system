import axios from 'axios';

const axiosInstance = axios.create({
<<<<<<< HEAD
  // baseURL: 'http://localhost:5001', // local commit check
  baseURL: 'http://54.79.147.114:5001', // live changed once again for another commit once again
=======
  baseURL: 'http://localhost:5001', // local commit check
  // baseURL: 'http://54.79.147.114:5001', // live changed once again for another commit once again
>>>>>>> origin/main
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
