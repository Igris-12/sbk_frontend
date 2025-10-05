import { Outlet, useParams, Link, useLocation } from "react-router-dom";

// Helper component for styled sidebar links
const SidebarLink = ({ to, text }) => {
    const location = useLocation();
    // Check if the current pathname segment matches the link's target path segment
    const pathSegment = to.split('/').pop();
    // The index route is matched against the path containing "dashboard"
    const isIndexActive = pathSegment === 'dashboard' && location.pathname.split('/').length === 3;
    const isSubPageActive = pathSegment !== 'dashboard' && location.pathname.includes(pathSegment);
    
    const isActive = isIndexActive || isSubPageActive;

    // Use the original design colors/classes
    return (
        <Link 
            to={to} 
            className={`
                block px-3 py-2 rounded-lg transition-colors text-sm font-medium 
                ${isActive 
                    ? 'bg-teal-400/20 text-teal-400 border border-teal-400/50' 
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-teal-400'
                }
            `}
        >
            {text}
        </Link>
    );
};


export default function DashboardLayout({ children }) {
  const { topic } = useParams();
  
  // Prevents "undefined" display when component mounts without a topic being fully loaded
  const readableTopic = topic ? 
      topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
      "Select Topic";

  return (
    <div className="flex min-h-[calc(100vh-64px)]"> 
      {/* Sidebar (Fixed, using your original bg color) */}
      <aside className="w-64 bg-[#0b1120] text-white p-6 space-y-6 border-r border-slate-700/50 flex-shrink-0">
        <h2 className="text-xl font-semibold mb-6 capitalize text-teal-400 border-b border-slate-700/50 pb-3">
          {readableTopic}
        </h2>

        <nav className="flex flex-col space-y-3">
            {/* The index path just uses the topic slug */}
          <SidebarLink to={`/dashboard/${topic}`} text="AI Summary & Conclusion" />
          <SidebarLink to={`/dashboard/${topic}/publications`} text="Publications" />
          <SidebarLink to={`/dashboard/${topic}/knowledge-graphs`} text="Knowledge Graphs" />
          <SidebarLink to={`/dashboard/${topic}/ai-insights`} text="AI Insights" />
        </nav>
      </aside>

      {/* Main Content Area (Scrollable) */}
      <main className="flex-1 bg-slate-900 overflow-y-auto p-6">
        {/* Renders the nested route content (Dashboard, PublicationsExplorer, etc.) */}
        {children || <Outlet />}
      </main>
    </div>
  );
}