import React from "react";
import { FiBookOpen, FiShare2, FiBarChart2, FiTarget } from 'react-icons/fi';

const SidebarItem = ({ icon, text, active }) => (
  <a href="#" className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
      active 
        ? 'bg-teal-400/20 text-teal-400 font-semibold' 
        : 'text-slate-100 hover:bg-slate-700 hover:text-teal-400'
    }`}>
    {icon}
    <span className="text-sm">{text}</span>
  </a>
);

const Sidebar = () => {
  return (
    <aside className="w-56 flex-shrink-0 bg-slate-800/50 border border-slate-700 rounded-xl p-4 backdrop-blur-sm">
      <nav className="flex flex-col gap-2">
        <SidebarItem icon={<FiBookOpen size={18} />} text="Publications Explorer" active />
        <SidebarItem icon={<FiShare2 size={18} />} text="Knowledge Graph" />
        <SidebarItem icon={<FiBarChart2 size={18} />} text="Insights & Summaries" />
        <SidebarItem icon={<FiTarget size={18} />} text="Mission Relevance" />
        <SidebarItem icon={<FiBarChart2 size={18} />} text="Trends & Gaps" />
      </nav>
    </aside>
  );
};

export default Sidebar;
