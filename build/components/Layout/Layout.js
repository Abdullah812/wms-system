import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
export const Layout = ({ children }) => {
    const { session } = useAuth();
    if (!session)
        return null;
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 flex", children: [_jsx(Sidebar, {}), _jsx("div", { className: "flex-1 mr-64", children: _jsx("main", { className: "py-4 h-screen overflow-y-auto", children: _jsx("div", { className: "max-w-[98%] mx-auto px-4", children: children }) }) })] }));
};
