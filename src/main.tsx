import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "../api-client-react/src/custom-fetch.js";

// Initialize API client with the backend URL from environment variables
const apiUrl = import.meta.env.VITE_API_URL || "";
console.log("[DEBUG] API URL initialized to:", apiUrl || "RELATIVE PATH (Check VITE_API_URL env var!)");
setBaseUrl(apiUrl);

createRoot(document.getElementById("root")!).render(<App />);
