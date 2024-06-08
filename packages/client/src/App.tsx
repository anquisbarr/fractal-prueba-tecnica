import type React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "../components/nav-bar";
const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <header className="bg-blue-600">
          <Navbar />
        </header>
        <main className="flex-grow p-4 bg-gray-100">
        </main>
      </div>
    </Router>
  );
};

export default App;
