import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { supabase } from '../../config/supabaseClient';
export const RecentTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    useEffect(() => {
        fetchRecentTransactions();
    }, []);
    const fetchRecentTransactions = async () => {
        const { data, error } = await supabase
            .from('transactions')
            .select(`
        *,
        products (name),
        users (name)
      `)
            .order('created_at', { ascending: false })
            .limit(10);
        if (!error && data) {
            setTransactions(data);
        }
    };
    const getStatusClass = (type) => {
        switch (type) {
            case 'IN':
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'OUT':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            case 'TRANSFER':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
        }
    };
    const getTransactionTypeLabel = (type) => {
        switch (type) {
            case 'IN': return 'وارد';
            case 'OUT': return 'صادر';
            case 'TRANSFER': return 'نقل';
            default: return type;
        }
    };
    return (_jsx("div", { className: "relative overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "px-6 py-3 text-right", children: "\u0627\u0644\u0645\u0646\u062A\u062C" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-right", children: "\u0646\u0648\u0639 \u0627\u0644\u0645\u0639\u0627\u0645\u0644\u0629" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-right", children: "\u0627\u0644\u0643\u0645\u064A\u0629" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-right", children: "\u0645\u0646" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-right", children: "\u0625\u0644\u0649" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-right", children: "\u0628\u0648\u0627\u0633\u0637\u0629" }), _jsx("th", { scope: "col", className: "px-6 py-3 text-right", children: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: transactions.map((transaction) => (_jsxs("tr", { className: "border-b", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right", children: transaction.products?.name || '-' }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right", children: _jsx("span", { className: `px-2 py-1 rounded-full text-sm ${getStatusClass(transaction.type)}`, children: getTransactionTypeLabel(transaction.type) }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right", children: transaction.quantity }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right", children: transaction.from_location || '-' }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right", children: transaction.to_location || '-' }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right", children: transaction.users?.name }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right", children: new Date(transaction.created_at).toLocaleDateString('ar-SA') })] }, transaction.id))) })] }) }));
};
