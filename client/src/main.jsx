import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom'; // <-- 1. Import this

// 2. Import Bootstrap CSS (You already did this, great!)
import 'bootstrap/dist/css/bootstrap.min.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter> {/* <-- 3. Wrap your App component */}
            <App />
        </BrowserRouter>
    </React.StrictMode>
);