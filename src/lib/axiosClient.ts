// lib/axiosClient.ts
import axios from "axios";

export const axiosClient = axios.create({
  baseURL: "/api", // API nội bộ Next.js
  headers: {
    "Content-Type": "application/json",
  },
});
