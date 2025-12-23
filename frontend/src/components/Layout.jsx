import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, Search, LogOut } from 'lucide-react';
import { logout } from '../api/auth';

const Layout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      logout();
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <Folder className="w-8 h-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-800 hidden sm:block">MyCloud</span>
        </div>

        <div className="flex-1 max-w-xl mx-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search files..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
            U
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-500">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>
      
      <main className="p-4 sm:p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;