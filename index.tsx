// React imports
import React from "react";
import ReactDOM from "react-dom/client";

// Main App
import App from "./App.tsx";

// Component imports
import "./DashboardViews.tsx";
import "./AiAssistantView.tsx";
import "./ProductAnalysisView.tsx";
import "./AnalysisView.tsx";
import "./DataEntryView.tsx";
import "./LayoutComponents.tsx";

// Services
import "./firebaseService.ts";
import "./geminiService.ts";

// Constants
import "./constants.ts";

// Render
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);