import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material';
import { createClient } from '@supabase/supabase-js';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import App from './App';
import './index.css';
// إنشاء عميل Supabase
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    }
});
// إنشاء ثيم عربي
const theme = createTheme({
    direction: 'rtl',
    typography: {
        fontFamily: [
            'Cairo',
            'Roboto',
            'Arial',
            'sans-serif'
        ].join(','),
    },
    components: {
        MuiTextField: {
            defaultProps: {
                dir: 'rtl'
            }
        }
    }
});
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(SessionContextProvider, { supabaseClient: supabase, children: _jsx(ThemeProvider, { theme: theme, children: _jsx(App, {}) }) }) }));
