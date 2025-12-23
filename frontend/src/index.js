import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { setupAxiosInterceptors } from './api/interceptors';

setupAxiosInterceptors();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

