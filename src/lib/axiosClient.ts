// lib/axiosClient.ts
import axios from "axios";
import { useEffect, useState } from "react";

export const axiosClient = axios.create({
  baseURL: "/api", // API nội bộ Next.js
  headers: {
    "Content-Type": "application/json",
  },
});
