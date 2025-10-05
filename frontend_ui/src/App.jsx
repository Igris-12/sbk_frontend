import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
// Removed HomeSidebar import

const AppContent = () => {
    // The header uses pt-16, so the main content starts below it.
    return (
        <div className="flex h-screen overflow-hidden pt-16">
            {/* Main Scrollable Content Area */}
            <main className="flex-1 overflow-y-auto">
                {/* The Outlet renders Home or DashboardLayout */}
                <Outlet />
            </main>
        </div>
    );
};

function App() {
  const [globalSearchTerm, setGlobalSearchTerm] = useState("");

  const handleSearch = (term) => {
    setGlobalSearchTerm(term);
  };

  return (
    <div className="min-h-screen bg-space-dark text-text-light font-sans antialiased">
      <Header onSearch={handleSearch} /> 
      <AppContent globalSearchTerm={globalSearchTerm} />
    </div>
  );
}

export default App;