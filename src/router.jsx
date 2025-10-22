import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./AppLayout.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PublicationsExplorer from "./pages/PublicationExplorer.jsx";
import KnowledgeGraph from "./pages/KnowledgeGraph.jsx";
import AllInsights from "./pages/AIInsights.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ChangePassword from "./pages/changePassword.jsx";
import Verify from "./pages/Verify.jsx";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />, // ✅ context provider
    children: [
      { index: true, element: <Home /> },
      {
        path: "dashboard/:topic",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "publications", element: <PublicationsExplorer /> },
          { path: "knowledge-graphs", element: <KnowledgeGraph /> },
          { path: "ai-insights", element: <AllInsights /> },
        ],
      },

      // ✅ move auth-related pages here
      { path: "login", element: <Login /> },
      { path: "sign-up", element: <Register /> },
      { path: "verify-account", element: <Verify /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "change-password", element: <ChangePassword /> },
    ],
  },
]);
