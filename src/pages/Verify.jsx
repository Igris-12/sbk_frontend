import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRocket } from "react-icons/fa";
import { FiShield } from "react-icons/fi";
import CircularProgress from '@mui/material/CircularProgress';
import OtpBox from '../components/OtpBox';
import { MyContext } from '../../src/AppLayout.jsx';
import { postData } from '../utils/api.js';
import AnimatedBackground from '../components/AnimatedBackground';

const Verify = () => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const context = useContext(MyContext);
  const history = useNavigate();

  const handleOtpChange = (value) => {
    setOtp(value);
  };

  const verifyOTP = (e) => {
    e.preventDefault();
    setIsLoading(true);

    const actionType = localStorage.getItem("actionType");
    
    if (actionType !== "forgot-password") {
      postData("/api/user/verifyEmail", {
        email: localStorage.getItem("userEmail"),
        otp: otp
      }).then((res) => {
        if (res?.success === true) {
          context.openAlertBox("success", res?.message);
          localStorage.removeItem("userEmail");
          setIsLoading(false);
          history("/login");
        } else {
          context.openAlertBox("error", res?.message);
          setIsLoading(false);
        }
      }).catch((error) => {
        console.error("Error:", error);
        context.openAlertBox("error", "Something went wrong!");
        setIsLoading(false);
      });
    } else {
      postData("/api/user/verify-forgot-password-otp", {
        email: localStorage.getItem("userEmail"),
        otp: otp
      }).then((res) => {
        if (res?.success === true) {
          context.openAlertBox("success", res?.message);
          setIsLoading(false);
          history("/forgot-password");
        } else {
          context.openAlertBox("error", res?.message);
          setIsLoading(false);
        }
      }).catch((error) => {
        console.error("Error:", error);
        context.openAlertBox("error", "Something went wrong!");
        setIsLoading(false);
      });
    }
  };

  return (
    <>
      <AnimatedBackground />
      <section className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-3xl shadow-2xl shadow-cyan-500/20 p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-cyan-500/50 relative">
                  <FiShield className="text-white" size={40} />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                    <FaRocket className="text-white" size={14} />
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Verify Your Email</h2>
                <p className="text-slate-400 mb-4">
                  We've sent a verification code to
                </p>
                <p className="text-cyan-400 font-semibold text-lg">
                  {localStorage.getItem("userEmail")}
                </p>
              </div>

              {/* OTP Input */}
              <form onSubmit={verifyOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-cyan-400 mb-4 text-center">
                    Enter 6-digit code
                  </label>
                  <OtpBox length={6} onChange={handleOtpChange} />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={otp.length !== 6 || isLoading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Verify OTP'}
                </button>
              </form>

              {/* Footer Info */}
              <div className="mt-6 text-center">
                <p className="text-slate-500 text-sm">
                  Didn't receive the code?{' '}
                  <button className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                    Resend
                  </button>
                </p>
              </div>

              {/* Decorative Elements */}
              <div className="mt-8 flex items-center justify-center gap-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-cyan-400/50 animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Verify;