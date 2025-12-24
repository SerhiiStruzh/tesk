import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FileSystemProvider } from './context/FileSystemContext';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import FolderPage from './pages/FolderPage';
import { FirebaseAuthProvider } from './context/FirebaseAuthContext';
import SharedPage from './pages/SharedPage';

function App() {
  return (
    <FileSystemProvider>
      <FirebaseAuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/folder/:id" element={<FolderPage />} />
          <Route path="/shared" element={<SharedPage />} />
        </Routes>
      </Router>
      </FirebaseAuthProvider>
    </FileSystemProvider>
  );
}

export default App;