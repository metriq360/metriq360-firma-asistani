// TÜM IMPORT'LAR SADECE "import" İLE YAPILIYOR (require YOK!!)

import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App.tsx";

// Component'ler
import "./DashboardViews.tsx";
import "./AiAssistantView.tsx";
import "./ProductAnalysisView.tsx";
import "./AnalysisView.tsx";
import "./DataEntryView.tsx";
import "./LayoutComponents.tsx";

// Servisler
import "./firebaseService.ts";
import "./geminiService.ts";

// Sabitler
import "./constants.ts";

// RENDER
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element bulunamadı!");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);