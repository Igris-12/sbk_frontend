import React from "react";
import { FaDna, FaRocket, FaFlask, FaGlobe } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';

const FilterItem = ({ icon, title, value }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-all duration-300 border border-transparent hover:border-cyan-500/30 group">
    <div className="text-cyan-400 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-slate-500 font-medium">{title}</p>
      <p className="text-sm font-semibold text-slate-300 truncate">{value}</p>
    </div>
    <FiChevronDown className="text-slate-500 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
  </div>
);

const FilterBar = () => {
  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-4 shadow-xl mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        <FilterItem 
          icon={<FaDna size={20} />} 
          title="Species" 
          value="Pisum, Zea L..." 
        />
        <FilterItem 
          icon={<FaRocket size={20} />} 
          title="Stc. Filter" 
          value="ISS, Shuttle (Intso)" 
        />
        <FilterItem 
          icon={<FaGlobe size={20} />} 
          title="Space Environment" 
          value="ISS, Skulls, Analog" 
        />
        <FilterItem 
          icon={<FaFlask size={20} />} 
          title="Experiment Type" 
          value="Lunar (Paer Mars)" 
        />
        <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-center px-3">
          <p className="text-xs text-slate-500 font-medium mb-1">Active Filters</p>
          <p className="text-sm font-semibold text-cyan-400 truncate">Plant/ecology, Growth</p>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;