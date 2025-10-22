import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEye, FaRocket } from "react-icons/fa";
import { IoIosEyeOff } from "react-icons/io";
import { FiMail, FiLock } from "react-icons/fi";
import CircularProgress from '@mui/material/CircularProgress';
import { MyContext } from '../../src/AppLayout.jsx';
import { postData } from '../utils/api.js';
import AnimatedBackground from '../components/AnimatedBackground';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [formFields, setFormFields] = useState({
        email: '',
        password: ''
    });

    const context = useContext(MyContext);
    const history = useNavigate();

    const forgotPassword = () => {
        if (formFields.email === "") {
            context.openAlertBox("error", "Please Enter Email");
            return false;
        } else {
            localStorage.setItem("userEmail", formFields.email);
            localStorage.setItem("actionType", 'forgot-password');

            postData("/api/user/forgot-password", {
                email: formFields.email,
            }).then((res) => {
                if (res?.success === true) {
                    context.openAlertBox("success", res?.message);
                    history("/verify-account");
                } else {
                    context.openAlertBox("error", res?.message);
                    localStorage.removeItem("actionType");
                    localStorage.removeItem("userEmail");
                }
            }).catch((error) => {
                console.error("Error:", error);
                context.openAlertBox("error", "Something went wrong!");
            });
        }
    };

    const onChangeInput = (e) => {
        const { name, value } = e.target;
        setFormFields(prev => ({ ...prev, [name]: value }));
    };

    const valideValue = Object.values(formFields).every(el => el);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (formFields.email === "") {
            context.openAlertBox("error", "Please Enter Email");
            setIsLoading(false);
            return false;
        }
        if (formFields.password === "") {
            context.openAlertBox("error", "Please Enter Password");
            setIsLoading(false);
            return false;
        }

        postData("/api/user/login", formFields, { withCredentials: true }).then((res) => {
            if (res?.success === true) {
                setIsLoading(false);
                context.openAlertBox("success", res?.message);
                setFormFields({
                    email: "",
                    password: ""
                });
                localStorage.setItem("accesstoken", res?.data?.accessToken);
                localStorage.setItem("refreshToken", res?.data.refreshToken);
                context.setIsLogin(true);
                // Check if there's a redirect URL stored
                const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
                if (redirectUrl) {
                    sessionStorage.removeItem('redirectAfterLogin'); // Clean up
                    history(redirectUrl); // Navigate to the article
                } else {
                    history("/"); // Default redirect to home
                }

            } else {
                context.openAlertBox("error", res?.message);
                setIsLoading(false);
            }
        });
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
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-cyan-500/50">
                                    <FaRocket className="text-white" size={32} />
                                </div>
                                <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                                <p className="text-slate-400">Sign in to continue your journey</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Email Field */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-cyan-400 mb-2">Email Address</label>
                                    <div className="relative">
                                        <FiMail className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formFields.email}
                                            disabled={isLoading}
                                            onChange={onChangeInput}
                                            placeholder="Enter your email"
                                            className="w-full bg-slate-900/50 backdrop-blur-xl border-2 border-cyan-500/20 rounded-xl py-3 pl-12 pr-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:shadow-lg focus:shadow-cyan-500/20 transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-cyan-400 mb-2">Password</label>
                                    <div className="relative">
                                        <FiLock className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            type={isShowPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formFields.password}
                                            disabled={isLoading}
                                            onChange={onChangeInput}
                                            placeholder="Enter your password"
                                            className="w-full bg-slate-900/50 backdrop-blur-xl border-2 border-cyan-500/20 rounded-xl py-3 pl-12 pr-12 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:shadow-lg focus:shadow-cyan-500/20 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setIsShowPassword(!isShowPassword)}
                                            className="absolute top-1/2 right-4 -translate-y-1/2 text-slate-400 hover:text-cyan-400 transition-colors"
                                        >
                                            {isShowPassword ? <FaEye size={20} /> : <IoIosEyeOff size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Forgot Password Link */}
                                <div className="text-right">
                                    <button
                                        type="button"
                                        onClick={forgotPassword}
                                        className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors"
                                    >
                                        Forgot Password?
                                    </button>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!valideValue || isLoading}
                                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-xl hover:shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                                >
                                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                                </button>
                            </form>

                            {/* Footer Links */}
                            <div className="mt-6 text-center">
                                <p className="text-slate-400">
                                    Don't have an account?{' '}
                                    <Link to="/sign-up" className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors">
                                        Create Account
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Login;