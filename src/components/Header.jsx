import React from 'react';
import { Link } from 'react-router-dom'; // 1. Make sure to import Link

const Header = ({ onSearch }) => {
  return (
    <header className="flex items-center justify-between p-4 px-8 border-b border-slate-700 bg-slate-950/90 backdrop-blur-md fixed w-full top-0 z-50 shadow-2xl">
      <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
        {/* Replace with your logo if you have one */}
        <h1 className="text-2xl font-bold tracking-wide text-slate-100">Space Bioscience Explorer</h1>
      </Link>
      
      {/* Your search functionality can remain here */}
  
    </header>
  );
};

export default Header;
