import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Header = () => {
    const isOnline = useSelector((state) => state.offline.isOnline);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">

                {/* Logo Section */}
                <div className="flex items-center space-x-4">
                    <Link to="/" className="text-2xl font-bold flex items-center group">
                        <span className="text-nepalRed mr-2 text-3xl group-hover:scale-110 transition-transform">🇳🇵</span>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-nepalBlue to-nepalRed">
                            Nepal Election
                        </span>
                    </Link>
                    {!isOnline && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full font-bold border border-yellow-200 animate-pulse">
                            OFFLINE MODE
                        </span>
                    )}
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex space-x-8">
                    {['Home', 'Results', 'Candidates'].map((item) => (
                        <Link
                            key={item}
                            to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                            className="text-gray-600 hover:text-nepalBlue font-medium transition-colors relative group py-2"
                        >
                            {item}
                            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-nepalBlue transition-all group-hover:w-full"></span>
                        </Link>
                    ))}
                    <Link
                        to="/admin/login"
                        className="bg-nepalBlue text-white px-5 py-2 rounded-full font-bold hover:bg-blue-700 transition shadow-md hover:shadow-lg"
                    >
                        Admin Portal
                    </Link>
                </nav>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="text-gray-600 focus:outline-none p-2 rounded hover:bg-gray-100"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isMenuOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-lg">
                    <div className="flex flex-col p-4 space-y-2">
                        {['Home', 'Results', 'Candidates'].map((item) => (
                            <Link
                                key={item}
                                to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg hover:text-nepalBlue transition-colors font-semibold"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item}
                            </Link>
                        ))}
                        <Link
                            to="/admin/login"
                            className="mt-4 bg-nepalBlue text-white text-center py-3 rounded-xl font-bold"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Admin Access
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
