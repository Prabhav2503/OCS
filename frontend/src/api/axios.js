import axios from 'axios';
import CryptoJS from 'crypto-js';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL  || "http://localhost:3000/api";
console.log("API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials:true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['token'] = token;
  }
  return config;
});

// Helper function to convert password to MD5 hash
const hashPassword = (password) => {
  return CryptoJS.MD5(password).toString();
};

// Auth APIs
export const loginUser = (userid, password) => {
// console.log(password)
  const hashedPassword = hashPassword(password);
//   console.log('MD5 Hash being sent:', hashedPassword);
  return api.post('/login', { userid, password: hashedPassword });
};

export const logoutUser = () => 
  api.post('/logout');

// Data APIs (Protected)
export const registerUser = (userid, role, password) => {
    const hashedPassword = hashPassword(password);
  return api.post('/register', { userid, role, password: hashedPassword });
};
export const createProfile = (profileData) => 
  api.post('/create-profile', profileData);

export const getProfiles = () => 
  api.get('/profiles');

export const applyToProfile = (profileCode) => 
  api.post(`/profile/${profileCode}`);

export const changeApplicationStatus = (profile_code, status, entry_number) => 
  api.post('/profile/application/change-status', { profile_code, status, entry_number });

export const acceptRejectOffer = (profile_code, status) => 
  api.post('/profile/application/accept', { profile_code, status });

export const getUserData = () => 
  api.post('/user/me');

export default api;
