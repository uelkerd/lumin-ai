import React from "react";
import "./App.css";
import TrustMetricsDashboard from "/home/user/lumin-ai/web-development/frontend/src/components/TrustMetricsDashboard"; // Use absolute path
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <main>
          <Routes>
            <Route path="/" element={<TrustMetricsDashboard />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
