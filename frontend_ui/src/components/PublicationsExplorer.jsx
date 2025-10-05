import React from "react";
// Make sure to add plant images to your src/assets folder
import plant1 from '../assets/plant-1.png';
import plant2 from '../assets/plant-2.png';

// Mock data for the table (kept intact)
const tableData = [
  { year: 195, author: 1, mission: 1, '3': 3.1, species: 10, nest: 13 },
  { year: 155, author: 1, mission: 11, '3': 1, species: 10, nest: 13 },
  { year: 1, author: 3, mission: 12, '3': 1, species: 2, nest: 10 },
  { year: 16, author: 3, mission: 12, '3': 1, species: 18, nest: 12 },
  { year: 5, author: 12, mission: 1, '3': 1, species: 7, nest: 13 },
  { year: 23, author: 5, mission: 1, '3': 1, species: 2, nest: 13 },
  { year: 8, author: 3, mission: 23, '3': 1, species: 7, nest: 11 },
];

const Tag = ({ text, active }) => (
  <button className={`px-3 py-1 text-xs rounded-md font-medium ${
    active 
       ? 'bg-teal-400 text-slate-900' // Changed: teal accent for active
       : 'bg-slate-700 text-slate-300 hover:bg-slate-600' // Changed: dark background for inactive
  }`}>
    {text}
  </button>
);

const PublicationsExplorer = () => {
  return (
    <div className="flex-1 bg-slate-900 p-6"> 
      <h2 className="text-3xl font-bold text-slate-100 mb-4 border-b border-teal-400 pb-2">
          Publications Explorer
      </h2>
      
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-700 mb-6"> {/* Changed: Border color */}
        {['Microgravity', 'Mars Analog', 'Genomics', 'Economics', 'Radiation'].map((tab) => (
          <button key={tab} className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            tab === 'Radiation' 
               ? 'text-teal-400 border-b-2 border-teal-400' // Changed: Teal accent
               : 'text-slate-400 hover:text-slate-200' // Changed: Light gray hover
          }`}>{tab}</button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left Section: Keywords and Table */}
        <div className="col-span-4">
          <div className="flex gap-2 mb-4">
            <Tag text="Keywords" />
            <Tag text="Plant-Microbe" />
            <Tag text="Radiation" active/>
          </div>
          {/* Changed: Use slate dark background and border */}
          <div className="bg-slate-800/50 rounded-lg p-2 border border-slate-700 shadow-xl"> 
            <table className="w-full text-left text-sm text-slate-300"> {/* Changed: Text color */}
              <thead>
                <tr className="text-slate-400 border-b border-slate-700"> {/* Changed: Border and text color */}
                  {Object.keys(tableData[0]).map(key => <th key={key} className="p-2 font-normal">{key}</th>)}
                </tr>
              </thead>
              <tbody>
                {/* Changed: Hover color */}
                {tableData.map((row, i) => ( 
                  <tr key={i} className="hover:bg-slate-700/50 transition-colors"> 
                    {Object.values(row).map((val, j) => <td key={j} className="p-2">{val}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Middle Section: Image Cards */}
        <div className="col-span-4 flex flex-col gap-6"> {/* Changed: Gap size for better spacing */}
          {/* Changed: Use slate dark background and border */}
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex-1 shadow-xl"> 
            <img src={plant1} className="rounded-md w-full h-40 object-cover" alt="Lunar Plant 1" /> {/* Changed: Height for visual appeal */}
            <p className="text-xs text-slate-400 mt-2">Lunar Plants</p> {/* Changed: Text color */}
            <p className="text-slate-100 font-semibold">Regolith centre</p> {/* Changed: Text color */}
          </div>
          {/* Changed: Use slate dark background and border */}
          <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex-[2] shadow-xl"> 
            <h3 className="text-base font-bold text-slate-100 mb-2">Arabidopsis Thaliana Growth in Lunar Regolith Simulant</h3> {/* Changed: Text color */}
            <p className="text-sm text-slate-400 mb-4"> {/* Changed: Text color */}
              Aiaesent bibess invessaet borrecutes estiaspect. Ehent bidine invessi. Bita
              doles dolless ...
            </p>
            <div className="flex items-center justify-between">
              <img src={plant2} className="w-10 h-10 rounded-full object-cover border border-slate-700" alt="Lunar Plant 2"/> {/* Changed: Border color */}
              {/* Changed: Teal accent button */}
              <button className="bg-teal-400 text-slate-900 font-bold py-2 px-5 rounded-lg text-sm hover:bg-teal-300 transition-colors">AI Summarizer</button>
            </div>
          </div>
        </div>
        
        {/* Right Section: AI Summary */}
        {/* Changed: Use slate dark background and border */}
        <div className="col-span-4 bg-slate-800/50 p-6 rounded-lg border border-slate-700 shadow-xl"> 
          <h3 className="text-lg font-bold text-slate-100 mb-2">AI Summary: Atoades...</h3> {/* Changed: Text color */}
          <div className="text-sm space-y-4 text-slate-300"> {/* Changed: Base text color */}
            <div>
              <h4 className="font-semibold text-teal-400 mb-1">Results</h4> {/* Changed: Accent color */}
              <ul className="list-disc list-inside text-slate-400 marker:text-teal-400"> {/* Changed: Text/Marker colors */}
                <li>Isum fianide est coenat egalis</li>
                <li>Board, esuae esuae est ubrae</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-teal-400 mb-1">Conclusions</h4> {/* Changed: Accent color */}
              <ul className="list-disc list-inside text-slate-400 marker:text-teal-400"> {/* Changed: Text/Marker colors */}
                <li>Aiaesent bibess invessaet borrecutes.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-teal-400 mb-1">Linked Missions</h4> {/* Changed: Accent color */}
              <ul className="list-disc list-inside text-slate-400 marker:text-teal-400"> {/* Changed: Text/Marker colors */}
                <li>Apollo 11 (Simulant)</li>
                <li>Artemis I (Payload)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicationsExplorer;