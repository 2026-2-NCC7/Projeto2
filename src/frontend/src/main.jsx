import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App-Supermercado-Demo.jsx"; // Alterado para mostrar a página do supermercado
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
