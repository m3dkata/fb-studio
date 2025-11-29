import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, MapPin, Phone, Mail, Heart } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Footer = () => {
    const { isAuthenticated } = useAuth();

    return (
        <footer className="relative mt-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 transition-colors duration-200">
            <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold font-heading text-gradient">FB Studio</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs">
                            Professional beauty services tailored to enhance your natural beauty.
                            Book your appointment today for a transformative experience.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="#" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-primary hover:bg-primary/10 transition-all duration-300">
                                <span className="sr-only">Instagram</span>
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-primary hover:bg-primary/10 transition-all duration-300">
                                <span className="sr-only">Facebook</span>
                                <Facebook className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Quick Links</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link to="/services" className="text-gray-500 dark:text-gray-400 hover:text-primary text-sm transition-colors flex items-center group">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary mr-2 transition-colors"></span>
                                    Services
                                </Link>
                            </li>
                            {isAuthenticated ? (
                                <>
                                    <li>
                                        <Link to="/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-primary text-sm transition-colors flex items-center group">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary mr-2 transition-colors"></span>
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/my-bookings" className="text-gray-500 dark:text-gray-400 hover:text-primary text-sm transition-colors flex items-center group">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary mr-2 transition-colors"></span>
                                            My Bookings
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/profile" className="text-gray-500 dark:text-gray-400 hover:text-primary text-sm transition-colors flex items-center group">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary mr-2 transition-colors"></span>
                                            Profile
                                        </Link>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li>
                                        <Link to="/login" className="text-gray-500 dark:text-gray-400 hover:text-primary text-sm transition-colors flex items-center group">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary mr-2 transition-colors"></span>
                                            Login
                                        </Link>
                                    </li>
                                    <li>
                                        <Link to="/register" className="text-gray-500 dark:text-gray-400 hover:text-primary text-sm transition-colors flex items-center group">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary mr-2 transition-colors"></span>
                                            Register
                                        </Link>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start group">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary mr-3 group-hover:scale-110 transition-transform">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <span className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                                    2972 Breznitsa, BG<br />
                                    Str. Ridyt 27
                                </span>
                            </li>
                            <li className="flex items-center group">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary mr-3 group-hover:scale-110 transition-transform">
                                    <Phone className="h-5 w-5" />
                                </div>
                                <span className="text-gray-500 dark:text-gray-400 text-sm">+359 123 456 789</span>
                            </li>
                            <li className="flex items-center group">
                                <div className="p-2 rounded-lg bg-primary/10 text-primary mr-3 group-hover:scale-110 transition-transform">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <span className="text-gray-500 dark:text-gray-400 text-sm">info@fbstudio.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 text-sm text-center md:text-left">
                        &copy; {new Date().getFullYear()} FB Studio. All rights reserved.
                    </p>
                    <p className="text-gray-400 text-sm flex items-center mt-2 md:mt-0">
                        Made with <Heart className="h-4 w-4 text-red-500 mx-1 animate-pulse" /> by KIDNEY
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
