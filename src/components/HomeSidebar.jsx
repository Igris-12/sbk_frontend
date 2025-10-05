import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiGitBranch, FiZap, FiSettings, FiHelpCircle, FiLogOut } from 'react-icons/fi';

const SidebarItem = ({ icon, text, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`
        flex items-center gap-3 px-5 py-3 rounded-lg transition-all duration-300
        ${isActive 
          ? 'bg-teal-400/20 text-teal-400 border border-teal-400/50 shadow-lg shadow-teal-400/20' 
          : 'text-slate-300 hover:bg-slate-800/70 hover:text-teal-400 border border-transparent'
        }
        group relative overflow-hidden
      `}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-teal-400/0 via-teal-400/5 to-teal-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="relative z-10 font-medium">{text}</span>
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-teal-400 rounded-r-full" />
      )}
    </Link>
  );
};

const HomeSidebar = () => (
  <aside className="h-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-700/50 shadow-2xl relative overflow-hidden flex flex-col">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/10 via-transparent to-transparent" />
    
    <div className="relative z-10 p-5 flex-1 flex flex-col">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-slate-700/50">
        <h2 className="text-xl font-bold text-teal-400 tracking-wide">
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
      <div className="mt-auto pt-6 border-t border-slate-700/50 space-y-2">
        {/* Quick Stats or Info Card */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mb-4">
          <p className="text-xs text-slate-400 mb-2">Research Papers</p>
          <p className="text-2xl font-bold text-teal-400">1,234</p>
          <p className="text-xs text-slate-500 mt-1">Total publications</p>
        </div>
        
        {/* Settings & Help */}
        <Link to="/settings" className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-teal-400 transition-colors">
          <FiSettings size={18} />
          <span className="text-sm">Settings</span>
        </Link>
        <Link to="/help" className="flex items-center gap-3 px-4 py-2 text-slate-400 hover:text-teal-400 transition-colors">
          <FiHelpCircle size={18} />
          <span className="text-sm">Help & Support</span>
        </Link>
      </div>
    </div>
  </aside>
);

export default HomeSidebar;