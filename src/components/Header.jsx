import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import { FaSatelliteDish } from 'react-icons/fa';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-950/95 backdrop-blur-xl border-b border-cyan-500/30 shadow-2xl shadow-cyan-500/20' 
          : 'bg-slate-950/80 backdrop-blur-lg border-b border-cyan-500/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Logo - Left Side */}
          <Link to="/" className="flex items-center gap-3 sm:gap-4 group relative">
            {/* Animated Satellite Icon */}
            <div className="relative">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full blur-lg opacity-40 group-hover:opacity-70 transition-all duration-500 animate-pulse"></div>
              
              {/* Rotating Ring */}
              <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 group-hover:border-cyan-400/40 animate-spin" style={{ animationDuration: '8s' }}></div>
              
              {/* Icon Container */}
              <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-xl shadow-cyan-500/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <FaSatelliteDish className="text-white group-hover:animate-pulse" size={22} />
              </div>
              
              {/* Orbit Dots */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50 animate-ping"></div>
              <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50 group-hover:animate-bounce"></div>
            </div>
            
            {/* Title - Desktop */}
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-wide group-hover:from-cyan-300 group-hover:via-blue-300 group-hover:to-purple-300 transition-all duration-300 drop-shadow-lg">
                Space Bioscience Explorer
              </h1>
              <div className="flex items-center gap-2 -mt-1">
                <div className="h-px w-8 bg-gradient-to-r from-cyan-400/50 to-transparent"></div>
                <p className="text-xs text-slate-400 group-hover:text-cyan-300 transition-colors font-medium tracking-wider">
                  NASA Space Biology Knowledge Engine
                </p>
              </div>
            </div>
            
            {/* Title - Mobile */}
            <div className="sm:hidden">
              <h1 className="text-lg font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent tracking-wide">
                Space Bioscience
              </h1>
              <p className="text-[10px] text-slate-400 -mt-0.5">NASA Knowledge Engine</p>
            </div>
          </Link>

          {/* Home Button - Right Side */}
          <Link
            to="/"
            className="group relative flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 text-cyan-400 font-semibold rounded-xl sm:rounded-2xl border border-cyan-500/30 hover:border-cyan-500/50 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/30 transition-all duration-300 hover:scale-105 overflow-hidden"
          >
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
            
            {/* Icon */}
            <div className="relative p-1.5 sm:p-2 bg-cyan-400/10 rounded-lg group-hover:bg-cyan-400/20 transition-colors">
              <FiHome size={18} className="group-hover:rotate-12 transition-transform duration-300" />
            </div>
            
            {/* Text */}
            <span className="relative text-sm sm:text-base hidden sm:inline">Home</span>
            
            {/* Sparkle Effect */}
            <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping"></div>
          </Link>

        </div>
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
    </header>
  );
};

export default Header;