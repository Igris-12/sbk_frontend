import React from "react";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import './index.css';

// Import all top-level components
import App from './App.jsx'; // Provides Header and main container
import Home from './pages/Home.jsx'; // Topic selection page
import Dashboard from './pages/Dashboard.jsx'; // AI Summary/Conclusion (index route)
import PublicationsExplorer from './pages/PublicationExplorer.jsx'; 
import KnowledgeGraph from './pages/KnowledgeGraph.jsx';
import AllInsights from './pages/AIInsights.jsx'
import DashboardLayout from './components/DashboardLayout.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
    children: [
      { index: true, element: <Home /> }, // Home page at root '/'
        
      // Dashboard Layout (Sidebar) for ALL TOPIC-SPECIFIC views
      {
        path: "dashboard/:topic",
        element: <DashboardLayout />,
        children: [
          // Path: /dashboard/:topic (Default view: AI Summary & Conclusion)
          { index: true, element: <Dashboard /> }, 
          // Path: /dashboard/:topic/publications
          { path: "publications", element: <PublicationsExplorer /> },
          // Path: /dashboard/:topic/knowledge-graphs
          { path: "knowledge-graphs", element: <KnowledgeGraph /> },
          // Path: /dashboard/:topic/ai-insights
          { path: "ai-insights", element: <AllInsights /> },
        ],
      },

      // Top-level navigation pages (if accessed outside a topic path, e.g., /KnowledgeGraph)
      { path: "PublicationExplorer", element: <PublicationsExplorer /> }, 
      { path: "KnowledgeGraph", element: <KnowledgeGraph /> },
      { path: "AIInsights", element: <AllInsights /> },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);