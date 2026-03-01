import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000",
});

// Attach JWT token automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      // console.log("Token attached to request:", token.substring(0, 20) + "...");
    } else {
      console.warn("No token found in localStorage");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized - token may be invalid or expired");
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("name");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;