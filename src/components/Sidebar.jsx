import React from "react";
import { FiBookOpen, FiShare2, FiBarChart2, FiTarget } from 'react-icons/fi';

const SidebarItem = ({ icon, text, active }) => (
  <a href="#" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      active 
        ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/10 font-semibold' 
        : 'text-slate-300 hover:bg-slate-800/70 hover:text-cyan-400 border border-transparent'
    } group relative overflow-hidden`}>
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className={`relative z-10 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
      {icon}
    </div>
    <span className="text-sm relative z-10">{text}</span>
    {active && (
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-400 rounded-r-full" />
    )}
  </a>
);

const Sidebar = () => {
  return (
    <aside className="w-64 flex-shrink-0 bg-slate-950/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/5 via-transparent to-blue-900/5 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="mb-6 pb-4 border-b border-cyan-500/20">
          <h2 className="text-lg font-bold text-cyan-400 tracking-wide">Navigation</h2>
          <p className="text-xs text-slate-500 mt-1">Explore Research</p>
        </div>
        
        <nav className="flex flex-col gap-2">
          <SidebarItem icon={<FiBookOpen size={20} />} text="Publications Explorer" active />
          <SidebarItem icon={<FiShare2 size={20} />} text="Knowledge Graph" />
          <SidebarItem icon={<FiBarChart2 size={20} />} text="Insights & Summaries" />
          <SidebarItem icon={<FiTarget size={20} />} text="Mission Relevance" />
          <SidebarItem icon={<FiBarChart2 size={20} />} text="Trends & Gaps" />
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;