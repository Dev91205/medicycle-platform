import axios from "axios";

const API = axios.create({
  baseURL: "https://medicycle-platform.onrender.com",
});


// Optional: auto attach token later
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
