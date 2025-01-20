import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { HomeIcon, CubeIcon, ArrowsRightLeftIcon, ChartBarIcon, UsersIcon, ArrowRightOnRectangleIcon, KeyIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { Drawer } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Logo } from './Logo';
const navigation = [
    { name: 'لوحة التحكم', href: '/dashboard', icon: HomeIcon },
    { name: 'المنتجات', href: '/products', icon: CubeIcon },
    { name: 'المعاملات', href: '/transactions', icon: ArrowsRightLeftIcon },
    { name: 'التقارير', href: '/reports', icon: ChartBarIcon },
    { name: 'العهد', href: '/custody', icon: KeyIcon },
];
export const Sidebar = () => {
    const location = useLocation();
    const { signOut, session } = useAuth();
    const [userRole, setUserRole] = React.useState(null);
    const supabase = useSupabaseClient();
    React.useEffect(() => {
        const getUserRole = async () => {
            if (session?.user?.id) {
                console.log('Logged in User ID:', session.user.id);
                console.log('Logged in User Email:', session.user.email);
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('email', session.user.email)
                    .single();
                console.log('Database Response:', { data, error });
                if (!error && data) {
                    setUserRole(data.role);
                }
            }
        };
        getUserRole();
    }, [session, supabase]);
    console.log('Current Role:', userRole);
    const fullNavigation = userRole === 'admin'
        ? [...navigation, { name: 'المستخدمين', href: '/users', icon: UsersIcon }]
        : navigation;
    const isAdmin = userRole === 'admin';
    const pathname = location.pathname;
    const pendingRequestsCount = 0; // Assuming pendingRequestsCount is not available in the current implementation
    return (_jsx(Drawer, { variant: "permanent", className: "w-64 lg:w-72", sx: {
            '& .MuiDrawer-paper': {
                width: {
                    xs: '14rem', // للشاشات الصغيرة جداً
                    sm: '15rem', // للشاشات الصغيرة
                    md: '16rem', // للشاشات المتوسطة
                    lg: '18rem', // للشاشات الكبيرة
                },
                boxSizing: 'border-box',
                borderLeft: '1px solid #E5E7EB',
                borderRight: 'none',
                display: {
                    xs: 'block', // يظهر دائماً
                }
            }
        }, children: _jsxs("div", { className: "flex grow flex-col gap-y-3 sm:gap-y-5 overflow-y-auto bg-white px-3 sm:px-6 pb-4", children: [_jsxs("div", { className: "flex h-14 sm:h-16 shrink-0 items-center justify-center border-b border-gray-200", children: [_jsx(Logo, { size: "sm", className: "sm:hidden" }), _jsx(Logo, { size: "md", className: "hidden sm:flex" })] }), _jsx("nav", { className: "flex flex-1 flex-col", children: _jsxs("ul", { role: "list", className: "flex flex-1 flex-col gap-y-4 sm:gap-y-7", children: [_jsx("li", { children: _jsxs("ul", { role: "list", className: "-mx-2 space-y-1", children: [fullNavigation.map((item) => {
                                            const isActive = location.pathname === item.href;
                                            return (_jsx("li", { children: _jsxs(Link, { to: item.href, className: `
                          group flex items-center gap-x-2 sm:gap-x-3 rounded-md p-2 sm:p-2.5 text-xs sm:text-sm font-medium leading-6
                          transition duration-150 ease-in-out
                          ${isActive
                                                        ? 'bg-primary-50 text-primary-600'
                                                        : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'}
                        `, children: [_jsx(item.icon, { className: `h-4 w-4 sm:h-5 sm:w-5 shrink-0 transition-colors duration-150
                            ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'}
                          ` }), item.name] }) }, item.name));
                                        }), isAdmin && (_jsx("li", { children: _jsxs(Link, { to: "/custody-requests", className: `${pathname === '/custody-requests'
                                                    ? 'bg-primary-800 text-white'
                                                    : 'text-primary-100 hover:bg-primary-800 hover:text-white'} group flex items-center px-2 py-2 text-sm font-medium rounded-md`, children: [_jsx(ClipboardDocumentCheckIcon, { className: "ml-3 h-6 w-6" }), "\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0639\u0647\u062F", pendingRequestsCount > 0 && (_jsx("span", { className: "mr-auto inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full", children: pendingRequestsCount }))] }) }))] }) }), _jsx("li", { className: "mt-auto border-t border-gray-200 pt-2 sm:pt-3", children: _jsxs("button", { onClick: () => signOut(), className: "group -mx-2 flex w-full items-center gap-x-2 sm:gap-x-3 rounded-md p-2 sm:p-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition duration-150 ease-in-out", children: [_jsx(ArrowRightOnRectangleIcon, { className: "h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-gray-400 group-hover:text-primary-600 transition-colors duration-150" }), "\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062E\u0631\u0648\u062C"] }) })] }) })] }) }));
};
