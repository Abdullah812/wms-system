import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Typography, Card, CardContent } from '@mui/material';
import { CubeIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
const StatCard = ({ title, value, icon: Icon, color }) => (_jsx(Card, { sx: { height: '100%' }, children: _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center mb-2", children: [_jsx(Icon, { className: "w-6 h-6", style: { color } }), _jsx("h2", { className: "text-lg font-semibold mr-1", style: { color }, children: title })] }), _jsx(Typography, { variant: "h4", component: "div", children: value })] }) }));
export const InventoryOverview = () => {
    const supabase = useSupabaseClient();
    const [stats, setStats] = useState({
        totalProducts: 0,
        incomingProducts: 0,
        outgoingProducts: 0,
        lowStockAlerts: 0
    });
    const [chartData, setChartData] = useState([]);
    useEffect(() => {
        const fetchStats = async () => {
            try {
                // إجمالي المنتجات
                const { count: totalProducts } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true });
                // المنتجات الواردة (آخر 30 يوم)
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const { count: incomingProducts } = await supabase
                    .from('transactions')
                    .select('*', { count: 'exact', head: true })
                    .eq('type', 'IN')
                    .gte('created_at', thirtyDaysAgo.toISOString());
                // المنتجات الصادرة (آخر 30 يوم)
                const { count: outgoingProducts } = await supabase
                    .from('transactions')
                    .select('*', { count: 'exact', head: true })
                    .eq('type', 'OUT')
                    .gte('created_at', thirtyDaysAgo.toISOString());
                // تنبيهات المخزون المنخفض
                const { count: lowStockAlerts } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .lt('quantity', 'minimum_quantity');
                setStats({
                    totalProducts: totalProducts || 0,
                    incomingProducts: incomingProducts || 0,
                    outgoingProducts: outgoingProducts || 0,
                    lowStockAlerts: lowStockAlerts || 0
                });
            }
            catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        const fetchChartData = async () => {
            try {
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('created_at, type, quantity')
                    .gte('created_at', thirtyDaysAgo.toISOString())
                    .order('created_at');
                if (transactions) {
                    const groupedData = transactions.reduce((acc, curr) => {
                        const date = new Date(curr.created_at).toLocaleDateString('ar-SA');
                        if (!acc[date]) {
                            acc[date] = { incoming: 0, outgoing: 0 };
                        }
                        if (curr.type === 'IN') {
                            acc[date].incoming += curr.quantity;
                        }
                        else if (curr.type === 'OUT') {
                            acc[date].outgoing += curr.quantity;
                        }
                        return acc;
                    }, {});
                    const formattedData = Object.entries(groupedData).map(([date, values]) => ({
                        date,
                        incoming: values.incoming,
                        outgoing: values.outgoing
                    }));
                    setChartData(formattedData);
                }
            }
            catch (error) {
                console.error('Error fetching chart data:', error);
            }
        };
        fetchStats();
        fetchChartData();
    }, [supabase]);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [_jsxs("div", { className: "group relative p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300", children: [_jsx("div", { className: `absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl` }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A" }), _jsx("p", { className: "mt-2 text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-300", children: stats.totalProducts })] }), _jsx("div", { className: `p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:scale-110 transition-transform duration-300`, children: _jsx(CubeIcon, { className: `w-6 h-6 text-blue-600 dark:text-blue-400` }) })] }), _jsxs("div", { className: "mt-4 flex items-center", children: [_jsx(ArrowTrendingUpIcon, { className: "w-4 h-4 text-green-600 dark:text-green-400" }), _jsx("span", { className: `mr-1 text-sm font-medium ${'text-green-600 dark:text-green-400'}`, children: "+12% \u0645\u0646 \u0627\u0644\u0634\u0647\u0631 \u0627\u0644\u0645\u0627\u0636\u064A" })] })] }), _jsxs("div", { className: "group relative p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300", children: [_jsx("div", { className: `absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl` }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0645\u0646\u062E\u0641\u0636\u0629" }), _jsx("p", { className: "mt-2 text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-300", children: stats.lowStockAlerts })] }), _jsx("div", { className: `p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full group-hover:scale-110 transition-transform duration-300`, children: _jsx(ExclamationTriangleIcon, { className: `w-6 h-6 text-amber-600 dark:text-amber-400` }) })] }), _jsx("div", { className: "mt-4 flex items-center", children: _jsx("span", { className: `mr-1 text-sm font-medium ${'text-amber-600 dark:text-amber-400'}`, children: "\u064A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0645\u0631\u0627\u062C\u0639\u0629" }) })] }), _jsxs("div", { className: "group relative p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300", children: [_jsx("div", { className: `absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl` }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0648\u0627\u0631\u062F\u0629" }), _jsx("p", { className: "mt-2 text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-300", children: stats.incomingProducts })] }), _jsx("div", { className: `p-3 bg-green-100 dark:bg-green-900/30 rounded-full group-hover:scale-110 transition-transform duration-300`, children: _jsx(ArrowTrendingUpIcon, { className: `w-6 h-6 text-green-600 dark:text-green-400` }) })] }), _jsx("div", { className: "mt-4 flex items-center", children: _jsx("span", { className: `mr-1 text-sm font-medium ${'text-green-600 dark:text-green-400'}`, children: "+12% \u0645\u0646 \u0627\u0644\u0634\u0647\u0631 \u0627\u0644\u0645\u0627\u0636\u064A" }) })] }), _jsxs("div", { className: "group relative p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300", children: [_jsx("div", { className: `absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl` }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400", children: "\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0635\u0627\u062F\u0631\u0629" }), _jsx("p", { className: "mt-2 text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-300", children: stats.outgoingProducts })] }), _jsx("div", { className: `p-3 bg-red-100 dark:bg-red-900/30 rounded-full group-hover:scale-110 transition-transform duration-300`, children: _jsx(ArrowTrendingDownIcon, { className: `w-6 h-6 text-red-600 dark:text-red-400` }) })] }), _jsx("div", { className: "mt-4 flex items-center", children: _jsx("span", { className: `mr-1 text-sm font-medium ${'text-red-600 dark:text-red-400'}`, children: "-12% \u0645\u0646 \u0627\u0644\u0634\u0647\u0631 \u0627\u0644\u0645\u0627\u0636\u064A" }) })] })] }), _jsxs("div", { className: "rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-100 dark:border-gray-700 p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white", children: "\u062D\u0631\u0643\u0629 \u0627\u0644\u0645\u062E\u0632\u0648\u0646" }), _jsxs("select", { className: "text-sm border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary-500", children: [_jsx("option", { children: "\u0622\u062E\u0631 7 \u0623\u064A\u0627\u0645" }), _jsx("option", { children: "\u0622\u062E\u0631 30 \u064A\u0648\u0645" }), _jsx("option", { children: "\u0622\u062E\u0631 3 \u0623\u0634\u0647\u0631" })] })] }), _jsx("div", { className: "h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(LineChart, { data: chartData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date", style: { fontFamily: 'Cairo' } }), _jsx(YAxis, { style: { fontFamily: 'Cairo' } }), _jsx(Tooltip, { contentStyle: { fontFamily: 'Cairo', textAlign: 'right' }, formatter: (value) => [`${value} قطعة`, ''], labelStyle: { fontFamily: 'Cairo' } }), _jsx(Legend, { formatter: (value) => value === 'incoming' ? 'وارد' : 'صادر' }), _jsx(Line, { type: "monotone", dataKey: "incoming", stroke: "#4caf50", strokeWidth: 2, name: "\u0648\u0627\u0631\u062F" }), _jsx(Line, { type: "monotone", dataKey: "outgoing", stroke: "#f44336", strokeWidth: 2, name: "\u0635\u0627\u062F\u0631" })] }) }) })] }), _jsxs("div", { className: "rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-100 dark:border-gray-700 p-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 dark:text-white mb-4", children: "\u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A \u0627\u0644\u0623\u0643\u062B\u0631 \u062D\u0631\u0643\u0629" }), _jsx("div", { className: "space-y-4", children: [1, 2, 3].map((item) => (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors", children: [_jsxs("div", { className: "flex items-center space-x-3 space-x-reverse", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062A\u062C" }), _jsx("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: "\u0627\u0644\u0641\u0626\u0629" })] })] }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "font-medium text-gray-900 dark:text-white", children: "234 \u0648\u062D\u062F\u0629" }), _jsx("p", { className: "text-sm text-green-600 dark:text-green-400", children: "+12%" })] })] }, item))) })] })] }));
};
