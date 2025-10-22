import React, { useState } from "react";
import { Outlet, useParams, Link, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiZap, FiBookOpen, FiGitBranch, FiTrendingUp } from "react-icons/fi";

const SidebarLink = ({ to, text, icon }) => {
    const location = useLocation();
    const pathSegment = to.split('/').pop();
    const isIndexActive = pathSegment === 'dashboard' && location.pathname.split('/').length === 3;
    const isSubPageActive = pathSegment !== 'dashboard' && location.pathname.includes(pathSegment);
    const isActive = isIndexActive || isSubPageActive;

    return (
        <Link 
            to={to}
            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-sm font-medium
                ${isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
                    : 'text-slate-300 hover:bg-slate-800/70 hover:text-cyan-400 border border-transparent'
                }
                group relative overflow-hidden
            `}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {icon}
            </div>
            <span className="relative z-10">{text}</span>
            {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full" />
            )}
        </Link>
    );
};

export default function DashboardLayout({ children }) {
  const { topic } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const readableTopic = topic ?
       topic.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) :
       "Select Topic";

  return (
    <div className="flex h-full">
      {/* Mobile Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full shadow-2xl shadow-cyan-500/50 hover:scale-110 transition-transform"
      >
        {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky left-0 h-[calc(100vh-4rem)] 
        bg-slate-950/95 backdrop-blur-xl border-r border-cyan-500/20 
        transition-transform duration-300 z-40 w-72
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        overflow-y-auto
      `}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/5 via-transparent to-blue-900/5 pointer-events-none" />
          
          <div className="relative z-10 p-6 space-y-6">
            {/* Header */}
            <div className="pb-4 border-b border-cyan-500/20">
              <h2 className="text-xl font-bold text-cyan-400 mb-1 capitalize">{readableTopic}</h2>
              <p className="text-xs text-slate-500">Topic Dashboard</p>
            </div>
            
            {/* Navigation */}
            <nav className="flex flex-col space-y-2">
              <SidebarLink 
                to={`/dashboard/${topic}`} 
                text="AI Summary & Conclusion" 
                icon={<FiZap size={18} />}
              />
              <SidebarLink 
                to={`/dashboard/${topic}/publications`} 
                text="Publications" 
                icon={<FiBookOpen size={18} />}
              />
              <SidebarLink 
                to={`/dashboard/${topic}/knowledge-graphs`} 
                text="Knowledge Graphs" 
                icon={<FiGitBranch size={18} />}
              />
              <SidebarLink 
                to={`/dashboard/${topic}/ai-insights`} 
                text="AI Insights" 
                icon={<FiTrendingUp size={18} />}
              />
            </nav>

            {/* Info Card */}
            <div className="mt-6 p-4 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl shadow-lg">
              <p className="text-xs text-slate-400 mb-2">Active Topic</p>
              <p className="text-lg font-bold text-cyan-400 capitalize">{readableTopic}</p>
              <p className="text-xs text-slate-500 mt-2">Explore research insights and publications</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30 top-16"
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 bg-slate-900/50 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}