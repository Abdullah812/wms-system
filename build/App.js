import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { Login } from './components/Auth/Login';
import { Dashboard } from './components/Dashboard/Dashboard';
import { ProductManagement } from './components/Products/ProductManagement';
import { TransactionForm } from './components/Transactions/TransactionForm';
import { InventoryReport } from './components/Reports/InventoryReport';
import { UserManagement } from './components/Users/UserManagement';
import { Sidebar } from './components/Layout/Sidebar';
import { AuthProvider } from './contexts/AuthContext';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useSession } from '@supabase/auth-helpers-react';
import { CustodyManagement } from './components/Custody/CustodyManagement';
import { CustodyRequests } from './components/Custody/CustodyRequests';
const PrivateRoute = ({ children, requireAdmin }) => {
    const session = useSession();
    const supabase = useSupabaseClient();
    const [userRole, setUserRole] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    React.useEffect(() => {
        const getUserRole = async () => {
            if (session?.user?.email) {
                const { data, error } = await supabase
                    .from('users')
                    .select('role')
                    .eq('email', session.user.email)
                    .single();
                if (!error && data) {
                    setUserRole(data.role);
                }
                setLoading(false);
            }
        };
        getUserRole();
    }, [session, supabase]);
    if (!session) {
        return _jsx(Navigate, { to: "/login" });
    }
    if (loading) {
        return _jsx("div", { children: "Loading..." });
    }
    if (requireAdmin && userRole !== 'admin') {
        return _jsx(Navigate, { to: "/dashboard" });
    }
    return children;
};
const Layout = ({ children }) => {
    return (_jsxs("div", { className: "flex", children: [_jsx(CssBaseline, {}), _jsx(Sidebar, {}), _jsx("div", { className: "flex-grow p-3", children: children })] }));
};
export const App = () => {
    const supabase = useSupabaseClient();
    const [isLoading, setIsLoading] = React.useState(true);
    useEffect(() => {
        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session && window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
            }
            catch (error) {
                console.error('Session check error:', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        checkSession();
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT' && window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        });
        return () => subscription.unsubscribe();
    }, [supabase]);
    if (isLoading) {
        return _jsx("div", { children: "\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0645\u064A\u0644..." });
    }
    return (_jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(PrivateRoute, { children: _jsx(Layout, { children: _jsx(Dashboard, {}) }) }) }), _jsx(Route, { path: "/products", element: _jsx(PrivateRoute, { children: _jsx(Layout, { children: _jsx(ProductManagement, {}) }) }) }), _jsx(Route, { path: "/transactions", element: _jsx(PrivateRoute, { children: _jsx(Layout, { children: _jsx(TransactionForm, {}) }) }) }), _jsx(Route, { path: "/reports", element: _jsx(PrivateRoute, { children: _jsx(Layout, { children: _jsx(InventoryReport, {}) }) }) }), _jsx(Route, { path: "/users", element: _jsx(PrivateRoute, { requireAdmin: true, children: _jsx(Layout, { children: _jsx(UserManagement, {}) }) }) }), _jsx(Route, { path: "/custody", element: _jsx(PrivateRoute, { children: _jsx(Layout, { children: _jsx(CustodyManagement, {}) }) }) }), _jsx(Route, { path: "/custody-requests", element: _jsx(PrivateRoute, { requireAdmin: true, children: _jsx(Layout, { children: _jsx(CustodyRequests, {}) }) }) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard" }) })] }) }) }));
};
export default App;
