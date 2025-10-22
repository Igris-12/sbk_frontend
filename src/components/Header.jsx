import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiLogOut, FiUser, FiMail } from 'react-icons/fi';
import { FaSatelliteDish } from 'react-icons/fa';
import { MyContext } from '../../src/AppLayout.jsx';
import { fetchDataFromApi } from '../utils/api';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const context = useContext(MyContext);
  const history = useNavigate();
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    setShowUserMenu(false);
    
    fetchDataFromApi(`/api/user/logout?token=${localStorage.getItem("accesstoken")}`, { withCredentials: true })
      .then((res) => {
        if (res?.success === true) {
          context.setIsLogin(false);
          localStorage.removeItem("accesstoken");
          localStorage.removeItem("refreshToken");
          context.openAlertBox("success", "You have been logged out.");
          history("/");
        }
      })
      .catch(err => {
        console.error("Logout failed:", err);
        context.openAlertBox("error", "Logout failed due to a network error.");
      });
  };

  const handleClick = (event) => {
    setShowUserMenu(!showUserMenu);
  };

  const handleClose = () => {
    setShowUserMenu(false);
  };
  
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

          {/* Right Side - User Menu & Home Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Show Login/Register if not logged in */}
            {context.isLogin === false ? (
              <div className="flex items-center gap-2">
                <Link 
                  to="/login" 
                  className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm sm:text-base transition-colors"
                >
                  Login
                </Link>
                <span className="text-slate-500">/</span>
                <Link 
                  to="/sign-up" 
                  className="text-cyan-400 hover:text-cyan-300 font-semibold text-sm sm:text-base transition-colors"
                >
                  Register
                </Link>
              </div>
            ) : (
              /* User Info & Menu when logged in */
              <div className="relative">
                <button
                  onClick={handleClick}
                  className="group flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20 rounded-xl border border-purple-500/30 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-purple-400 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                      <FiUser className="text-white" size={16} />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-950 shadow-lg"></div>
                  </div>
                  
                  {/* User Email - Desktop */}
                  <div className="hidden lg:block text-left">
                    <p className="text-xs text-slate-400 font-medium">Welcome back</p>
                    <p className="text-sm text-cyan-300 font-semibold -mt-0.5">{context?.userData?.email}</p>
                  </div>

                  {/* Dropdown Arrow */}
                  <div className="hidden sm:block">
                    <svg className={`w-4 h-4 text-cyan-400 transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info Section */}
                    <div className="p-4 border-b border-cyan-500/20 bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg">
                          <FiUser className="text-white" size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-white truncate capitalize">{context?.userData?.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <FiMail className="text-cyan-400 flex-shrink-0" size={12} />
                            <p className="text-xs text-slate-400 truncate">{context?.userData?.email}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 group"
                      >
                        <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                          <FiLogOut size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold">Sign Out</p>
                          <p className="text-xs text-slate-500">Logout from your account</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Home Button */}
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
      </div>

      {/* Bottom Accent Line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
    </header>
  );
};

export default Header;