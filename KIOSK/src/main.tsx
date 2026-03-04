import React from "react";
import ReactDOM from "react-dom/client";
import { AppRoutes } from "./UI/routes";
import "./index.css";

ReactDOM.createRoot(document.getElementById("app")!).render(
  <React.StrictMode>
    <AppRoutes />
  </React.StrictMode>
);
