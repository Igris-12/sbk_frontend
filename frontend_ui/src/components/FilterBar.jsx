import React from "react";
import { FaDna, FaRocket, FaFlask, FaGlobe } from 'react-icons/fa';
import { FiChevronDown } from 'react-icons/fi';

const FilterItem = ({ icon, title, value }) => (
  <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-nasa-dark-gray/50 cursor-pointer transition-colors">
    {icon}
    <div>
      <p className="text-xs text-nasa-gray">{title}</p>
      <p className="text-sm font-medium text-nasa-light-gray">{value}</p>
    </div>
    <FiChevronDown className="ml-auto text-nasa-gray" />
  </div>
);

const FilterBar = () => {
  return (
    // This component now has a rounded border to match the others
    <div className="flex items-center justify-between p-3 px-6 border border-nasa-border rounded-xl bg-nasa-sidebar-bg/50 backdrop-blur-sm">
      <FilterItem icon={<FaDna size={18} className="text-nasa-accent-cyan" />} title="Species" value="Pusum, Zea L..." />
      <FilterItem icon={<FaRocket size={18} className="text-nasa-accent-cyan" />} title="Stc. Filter" value="ISS, Shuttle (Intso)" />
      <FilterItem icon={<FaGlobe size={18} className="text-nasa-accent-cyan" />} title="Space Environment" value="ISS, Skulls, Analog" />
      <FilterItem icon={<FaFlask size={18} className="text-nasa-accent-cyan" />} title="Experiment Type" value="Lunar (Paer Mars)" />
      <div className="text-right pr-4">
        <p className="text-xs text-nasa-gray">Filters</p>
        <p className="text-sm font-medium text-nasa-light-gray">Plant/ecology, Growth</p>
      </div>
    </div>
  );
};

export default FilterBar;