// React imports
import React from "react";
import ReactDOM from "react-dom/client";

// Main App
import App from "./App.tsx";

// --- TÜM TSX DOSYALARINI BABEL'E DAHİL EDİYORUZ ---

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

// --------------------------------------------------

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
