import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const d = document.createElement("div");
d.id = "root";
document.body.appendChild(d);
ReactDOM.createRoot(d).render(<App />);
