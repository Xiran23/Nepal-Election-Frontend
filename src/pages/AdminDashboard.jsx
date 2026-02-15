import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import CandidatesTable from '../components/admin/CandidatesTable';
import LiveResultsEntry from '../components/admin/LiveResultsEntry';
import DistrictsTable from '../components/admin/DistrictsTable';
import PartiesTable from '../components/admin/PartiesTable';
import {
    LayoutDashboard,
    Users,
    MapPin,
    Flag,
    BarChart3,
    Settings,
    LogOut,
    Bell,
    TrendingUp,
    Shield,
    Database,
    Zap,
    Plus,
    CheckCircle,
    Clock,
    Layers
} from 'lucide-react';
import { logout } from '../store/authSlice';

// Placeholder sub-components for tabs
const OverviewTab = () => (
    <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
                { label: 'Total Districts', value: '77', icon: MapPin, color: 'bg-blue-500' },
                { label: 'Registered Candidates', value: '842', icon: Users, color: 'bg-indigo-500' },
                { label: 'Votes Counted', value: '4.2M', icon: Database, color: 'bg-emerald-500' },
                { label: 'System Uptime', value: '99.9%', icon: Zap, color: 'bg-amber-500' },
            ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
                    <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                        <stat.icon className="w-7 h-7" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-3xl font-black text-slate-800">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Clock className="text-indigo-600" /> Recent System Logs
                </h3>
                <div className="space-y-4">
                    {[
                        { action: 'Vote Update', details: 'District: Achham, Constituency 1', time: '2 mins ago', icon: TrendingUp },
                        { action: 'New Candidate', details: 'Gagan Thapa added to Kathmandu', time: '15 mins ago', icon: Plus },
                        { action: 'Backup Success', details: 'Automated database backup completed', time: '1 hour ago', icon: CheckCircle },
                    ].map((log, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-2xl transition group border border-transparent hover:border-slate-100">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-white transition group-hover:shadow-sm">
                                <log.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm font-bold text-slate-800">{log.action}</p>
                                <p className="text-xs text-slate-400 font-medium">{log.details}</p>
                            </div>
                            <span className="text-[10px] font-bold text-slate-300 uppercase">{log.time}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 rounded-3xl shadow-lg text-white relative overflow-hidden">
                <div className="relative z-10">
                    <h3 className="text-2xl font-black mb-2 italic tracking-tight">Staff Tip: Security First</h3>
                    <p className="text-indigo-100 text-sm mb-6 max-w-sm">Never share your admin credentials. All database updates are logged with your unique staff ID and IP address for audit purposes.</p>
                    <button className="bg-white text-indigo-700 px-6 py-3 rounded-xl text-sm font-black hover:bg-slate-50 transition shadow-xl">
                        View Security Protocol
                    </button>
                </div>
                <Shield className="absolute -bottom-10 -right-10 w-48 h-48 text-white/10" />
            </div>
        </div>
    </div>
);

const DistrictsTab = () => (
    <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center">
        <MapPin className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800">District Management Coming Soon</h3>
        <p className="text-slate-400 max-w-md mx-auto mt-2 font-medium">We are currently integrating the official district boundary coordinates from the Election Commission GIS server.</p>
    </div>
);

const PartiesTab = () => (
    <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center">
        <Flag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800">Political Parties Database</h3>
        <p className="text-slate-400 max-w-md mx-auto mt-2 font-medium">Symbol registration and party profile updates are being migrated to the new schema.</p>
    </div>
);

const AnalysisTab = () => (
    <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center">
        <BarChart3 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800">Advanced Analytics Engine</h3>
        <p className="text-slate-400 max-w-md mx-auto mt-2 font-medium">Real-time swing analysis and voter turnout heatmaps will be available during live counting hours.</p>
    </div>
);

const SettingsTab = () => (
    <div className="bg-white p-20 rounded-3xl border border-dashed border-slate-200 text-center">
        <Settings className="w-12 h-12 text-slate-200 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-800">System Configuration</h3>
        <p className="text-slate-400 max-w-md mx-auto mt-2 font-medium">Backup settings and user role permissions are managed by the lead system administrator.</p>
    </div>
);

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector(state => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/admin/login');
    };

    const menuItems = [
        { id: 'overview', label: 'Command Center', icon: LayoutDashboard, category: 'Main' },
        { id: 'live-entry', label: 'Update Votes', icon: TrendingUp, category: 'Real-time' },
        { id: 'candidates', label: 'Candidates', icon: Users, category: 'Management' },
        { id: 'districts', label: 'Districts', icon: MapPin, category: 'Management' },
        { id: 'parties', label: 'Political Parties', icon: Flag, category: 'Management' },
        { id: 'analysis', label: 'Election Analysis', icon: BarChart3, category: 'Tools' },
        { id: 'settings', label: 'System Settings', icon: Settings, category: 'Config' },
    ];

    const categories = ['Main', 'Real-time', 'Management', 'Tools', 'Config'];

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return <OverviewTab />;
            case 'live-entry': return <LiveResultsEntry />;
            case 'candidates': return <CandidatesTable />;
            case 'districts': return <DistrictsTable />;
            case 'parties': return <PartiesTable />;
            case 'analysis': return <AnalysisTab />;
            case 'settings': return <SettingsTab />;
            default: return <OverviewTab />;
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen overflow-hidden shrink-0">
                <div className="p-8 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Shield className="text-white w-6 h-6" />
                    </div>
                    <span className="font-black text-xl text-slate-800 tracking-tight">Staff Portal</span>
                </div>

                <nav className="flex-1 p-6 overflow-y-auto space-y-8 scrollbar-hide">
                    {categories.map(category => (
                        <div key={category} className="space-y-2">
                            <h4 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{category}</h4>
                            <div className="space-y-1">
                                {menuItems.filter(item => item.category === category).map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setActiveTab(item.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${activeTab === item.id
                                            ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 mb-6 flex items-center gap-3 shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                            {user?.username?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate">{user?.username || 'Staff Member'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{user?.role || 'Operator'}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                            {menuItems.find(i => i.id === activeTab)?.label}
                        </h2>
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter">API V2 Online</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="hidden lg:flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                            <div className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5" /> Synchronized</div>
                            <div className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-500" /> Latency: 12ms</div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 mx-2 hidden lg:block"></div>
                        <button className="relative p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10 bg-[#F8FAFC]">
                    <div className="max-w-7xl mx-auto">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
