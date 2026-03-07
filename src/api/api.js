import axios from "axios";

// Shared Axios instance for backend API calls
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api",
  withCredentials: true,
});