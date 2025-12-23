import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder } from 'lucide-react';
import { useAuth } from '../context/FirebaseAuthContext';
import { authWithGoogleToken } from '../api/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuth();

  const handleLogin = async () => {
    try {
      const result = await loginWithGoogle();
      const idToken = await result.user.getIdToken();
      await authWithGoogleToken(idToken);
      navigate('/dashboard');
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-blue-100 p-4 rounded-full">
            <Folder className="w-12 h-12 text-blue-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Cloud Storage</h2>
        <p className="text-gray-500 mb-8">Securely store and manage your files.</p>
        
        <button 
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-sm"
        >
          <img 
            src="https://www.svgrepo.com/show/475656/google-color.svg" 
            alt="Google Logo" 
            className="w-6 h-6" 
          />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default LoginPage;