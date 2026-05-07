import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "../api-client-react/src/custom-fetch.js";

// Initialize API client with the backend URL from environment variables
setBaseUrl(import.meta.env.VITE_API_URL || "");

createRoot(document.getElementById("root")!).render(<App />);
