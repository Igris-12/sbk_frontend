import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiGitBranch, FiZap, FiSettings, FiHelpCircle } from 'react-icons/fi';

const SidebarItem = ({ icon, text, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
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
      <span className="relative z-10 font-medium text-sm">{text}</span>
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full" />
      )}
    </Link>
  );
};

const HomeSidebar = () => (
  <aside className="hidden lg:block w-64 h-full bg-slate-950/90 backdrop-blur-xl border-r border-cyan-500/20 shadow-2xl relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/5 via-transparent to-blue-900/5 pointer-events-none" />
    
    <div className="relative z-10 p-6 flex flex-col h-full">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-cyan-500/20">
        <h2 className="text-xl font-bold text-cyan-400 tracking-wide">
          Navigation
        </h2>
        <p className="text-xs text-slate-500 mt-1">Explore NASA Bioscience</p>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex flex-col gap-2 flex-1">
        <SidebarItem icon={<FiHome size={20} />} text="Dashboard" to="/" />
        <SidebarItem icon={<FiSearch size={20} />} text="Publication Explorer" to="/PublicationExplorer" />
        <SidebarItem icon={<FiGitBranch size={20} />} text="Knowledge Graph" to="/KnowledgeGraph" />
        <SidebarItem icon={<FiZap size={20} />} text="AI Insights" to="/AIInsights" />
      </nav>
      
      {/* Bottom Section */}
      <div className="mt-auto pt-6 border-t border-cyan-500/20 space-y-4">
        {/* Quick Stats Card */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-4 shadow-lg">
          <p className="text-xs text-slate-400 mb-2">Research Papers</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">1,234</p>
          <p className="text-xs text-slate-500 mt-1">Total publications</p>
        </div>
        
        {/* Settings & Help */}
        <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800/50">
          <FiSettings size={18} />
          <span className="text-sm">Settings</span>
        </Link>
        <Link to="/help" className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-slate-800/50">
          <FiHelpCircle size={18} />
          <span className="text-sm">Help & Support</span>
        </Link>
      </div>
    </div>
  </aside>
);

export default HomeSidebar;