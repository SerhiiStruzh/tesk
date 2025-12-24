import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Folder, LogOut, Users, HardDrive } from 'lucide-react'; 
import { logout } from '../api/auth';

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation(); 

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3 flex justify-between items-center">
        
        <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                <div className="bg-blue-600 p-1.5 rounded-lg">
                    <Folder className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800 hidden sm:block">MyCloud</span>
            </div>

            <nav className="hidden md:flex gap-1">
                <button 
                    onClick={() => navigate('/dashboard')}
                    className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <HardDrive className="w-4 h-4" /> My Drive
                </button>
                <button 
                    onClick={() => navigate('/shared')}
                    className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors ${location.pathname === '/shared' ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                    <Users className="w-4 h-4" /> Shared with me
                </button>
            </nav>
        </div>

         <div className="flex items-center gap-4">
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-500">
                <LogOut className="w-5 h-5" />
            </button>
        </div>
      </header>
      
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};

export default Layout;