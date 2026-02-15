import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-[#E0E9F6] py-12 mt-auto ">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
                    <div className="text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start mb-2 space-x-2">
                            <img src="/flag_of_nepal.gif" alt="Flag of Nepal" className="w-10 h-10" />
                            <h3 className="text-lg font-bold text-black tracking-wide">Election Commission, Nepal</h3>
                        </div>
                        <p className="text-sm text-black font-medium">Securing Democracy through Free & Fair Elections</p>
                    </div>

                    <div className="flex space-x-6 text-sm">
                        <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
                        <a href="#" className="hover:text-white transition-colors duration-200">Contact Support</a>
                    </div>

                    <div className="text-xs text-slate-600 font-mono">
                        © {new Date().getFullYear()} NEMS. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
