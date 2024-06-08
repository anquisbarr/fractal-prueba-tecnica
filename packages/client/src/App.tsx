import type React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "../components/nav-bar";
import AddEditOrder from "../pages/add-edit-order";
import MyOrders from "../pages/my-orders";

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col h-screen">
        <header className="bg-blue-600">
          <Navbar />
        </header>
        <main className="flex-grow p-4 bg-gray-100">
          <Routes>
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/add-order" element={<AddEditOrder />} />
            <Route path="/add-order/:orderNumber" element={<AddEditOrder />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
