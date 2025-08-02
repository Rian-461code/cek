import React from 'react';
import ReactDOM from 'react-dom/client';

// Baris ini akan berhasil karena file App.jsx sekarang ada.
import App from './App'; 

// Anda bisa menambahkan file CSS global di sini jika perlu.
// import './index.css';

/**
 * Titik Masuk Aplikasi React (Entry Point)
 * Tugasnya hanya satu: memuat komponen <App /> ke dalam HTML.
 */
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
