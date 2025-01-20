import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { ResponsiveBar } from '@nivo/bar';
import { ArrowDownTrayIcon, PrinterIcon } from '@heroicons/react/24/outline';
import html2pdf from 'html2pdf.js';
import { CubeIcon, ArrowPathIcon, ExclamationTriangleIcon, UserGroupIcon } from '@heroicons/react/24/outline';
export const InventoryReport = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [filters, setFilters] = useState({
        category: '',
        stockStatus: 'all' // all, low, out
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [reportType, setReportType] = useState('inventory');
    const [dateRange, setDateRange] = useState({ from: '', to: '' });
    const [location, setLocation] = useState('');
    const [userId, setUserId] = useState('');
    const [summary, setSummary] = useState({
        totalProducts: 0,
        totalTransactions: 0,
        lowStock: 0,
        activeUsers: 0
    });
    const [users, setUsers] = useState([]);
    useEffect(() => {
        fetchProducts();
        fetchUsers();
    }, []);
    useEffect(() => {
        applyFilters();
    }, [filters, products]);
    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .order('name');
        if (error) {
            setError('حدث خطأ أثناء جلب البيانات');
        }
        else {
            setProducts(data || []);
            setFilteredProducts(data || []);
        }
        setLoading(false);
    };
    const applyFilters = () => {
        let filtered = [...products];
        if (filters.category) {
            filtered = filtered.filter(p => p.category === filters.category);
        }
        switch (filters.stockStatus) {
            case 'low':
                filtered = filtered.filter(p => p.quantity <= p.minimum_quantity && p.quantity > 0);
                break;
            case 'out':
                filtered = filtered.filter(p => p.quantity === 0);
                break;
        }
        setFilteredProducts(filtered);
    };
    const exportToExcel = () => {
        // تنفيذ تصدير البيانات إلى Excel
        // يمكن استخدام مكتبة مثل xlsx
    };
    const exportToPDF = () => {
        const element = document.getElementById('report-content');
        const opt = {
            margin: 1,
            filename: 'تقرير_المخزون.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: {
                unit: 'in',
                format: 'a4',
                orientation: 'portrait',
                language: 'ar'
            }
        };
        html2pdf().set(opt).from(element).save();
    };
    const getCategories = () => {
        const categories = new Set(products.map(p => p.category).filter((c) => c !== null));
        return Array.from(categories);
    };
    const handleExport = () => {
        // Implementation of handleExport function
    };
    const handlePrint = () => {
        // Implementation of handlePrint function
    };
    const fetchUsers = async () => {
        setLoading(true);
        try {
            // جلب بيانات المستخدمين من الجدول
            const { data: usersData, error: usersError } = await supabase
                .from('users')
                .select('*');
            // جلب بيانات المصادقة
            const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
            if (usersError || authError) {
                setError('حدث خطأ أثناء جلب البيانات');
            }
            else if (usersData) {
                // دمج البيانات وتحديد المستخدمين النشطين
                const updatedUsers = usersData.map(user => {
                    const authUser = authData?.users?.find(auth => auth.id === user.id);
                    const lastSignIn = authUser?.last_sign_in_at;
                    const isActive = lastSignIn ?
                        (new Date().getTime() - new Date(lastSignIn).getTime()) < (24 * 60 * 60 * 1000) : false;
                    return {
                        ...user,
                        last_sign_in_at: lastSignIn,
                        active: isActive
                    };
                });
                setUsers(updatedUsers);
            }
        }
        catch (error) {
            setError('حدث خطأ أثناء جلب البيانات');
        }
        setLoading(false);
    };
    useEffect(() => {
        if (reportType === 'users') {
            fetchUsers();
        }
    }, [reportType]);
    useEffect(() => {
        // تحديث ملخص التقرير
        setSummary({
            totalProducts: products.length,
            totalTransactions: 0, // يمكن تحديثها من جدول الحركات
            lowStock: products.filter(p => p.quantity <= p.minimum_quantity).length,
            activeUsers: users.filter(u => u.active).length
        });
    }, [products, users]);
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "sm:flex sm:items-center justify-between py-6", children: [_jsx("div", { className: "sm:flex-auto", children: _jsx("h1", { className: "text-2xl lg:text-3xl font-bold text-gray-900", children: "\u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631" }) }), _jsxs("div", { className: "mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3", children: [_jsxs("select", { value: reportType, onChange: (e) => setReportType(e.target.value), className: "block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-base", children: [_jsx("option", { value: "inventory", children: "\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u062E\u0632\u0648\u0646" }), _jsx("option", { value: "transactions", children: "\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u062D\u0631\u0643\u0627\u062A" }), _jsx("option", { value: "users", children: "\u062A\u0642\u0631\u064A\u0631 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646" })] }), _jsxs("button", { onClick: handleExport, className: "w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors", children: [_jsx(ArrowDownTrayIcon, { className: "h-5 w-5 ml-2" }), "\u062A\u0635\u062F\u064A\u0631"] }), _jsxs("button", { onClick: handlePrint, className: "w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors", children: [_jsx(PrinterIcon, { className: "h-5 w-5 ml-2" }), "\u0637\u0628\u0627\u0639\u0629"] })] })] }), _jsxs("div", { className: "mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0645\u0646 \u062A\u0627\u0631\u064A\u062E" }), _jsx("input", { type: "date", value: dateRange.from, onChange: (e) => setDateRange({ ...dateRange, from: e.target.value }), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0625\u0644\u0649 \u062A\u0627\u0631\u064A\u062E" }), _jsx("input", { type: "date", value: dateRange.to, onChange: (e) => setDateRange({ ...dateRange, to: e.target.value }), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0627\u0644\u0645\u0648\u0642\u0639" }), _jsx("select", { value: location, onChange: (e) => setLocation(e.target.value), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm", children: _jsx("option", { value: "", children: "\u0627\u0644\u0643\u0644" }) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" }), _jsx("select", { value: userId, onChange: (e) => setUserId(e.target.value), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm", children: _jsx("option", { value: "", children: "\u0627\u0644\u0643\u0644" }) })] })] }), _jsxs("div", { className: "mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white overflow-hidden shadow rounded-lg", children: _jsx("div", { className: "p-5", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(CubeIcon, { className: "h-6 w-6 text-gray-400" }) }), _jsxs("div", { className: "mr-5", children: [_jsx("p", { className: "text-sm font-medium text-gray-500 truncate", children: "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A" }), _jsx("p", { className: "mt-1 text-xl font-semibold text-gray-900", children: summary.totalProducts })] })] }) }) }), _jsx("div", { className: "bg-white overflow-hidden shadow rounded-lg", children: _jsx("div", { className: "p-5", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(ArrowPathIcon, { className: "h-6 w-6 text-gray-400" }) }), _jsxs("div", { className: "mr-5", children: [_jsx("p", { className: "text-sm font-medium text-gray-500 truncate", children: "\u0639\u062F\u062F \u0627\u0644\u062D\u0631\u0643\u0627\u062A" }), _jsx("p", { className: "mt-1 text-xl font-semibold text-gray-900", children: summary.totalTransactions })] })] }) }) }), _jsx("div", { className: "bg-white overflow-hidden shadow rounded-lg", children: _jsx("div", { className: "p-5", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(ExclamationTriangleIcon, { className: "h-6 w-6 text-yellow-400" }) }), _jsxs("div", { className: "mr-5", children: [_jsx("p", { className: "text-sm font-medium text-gray-500 truncate", children: "\u0645\u0646\u062A\u062C\u0627\u062A \u062A\u062D\u062A \u0627\u0644\u062D\u062F" }), _jsx("p", { className: "mt-1 text-xl font-semibold text-gray-900", children: summary.lowStock })] })] }) }) }), _jsx("div", { className: "bg-white overflow-hidden shadow rounded-lg", children: _jsx("div", { className: "p-5", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(UserGroupIcon, { className: "h-6 w-6 text-gray-400" }) }), _jsxs("div", { className: "mr-5", children: [_jsx("p", { className: "text-sm font-medium text-gray-500 truncate", children: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646 \u0627\u0644\u0646\u0634\u0637\u064A\u0646" }), _jsx("p", { className: "mt-1 text-xl font-semibold text-gray-900", children: summary.activeUsers })] })] }) }) })] }), _jsx("div", { className: "mt-8", children: loading ? (_jsx("div", { className: "bg-white p-8 rounded-lg shadow-sm flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent" }) })) : error ? (_jsx("div", { className: "bg-red-50 p-4 rounded-lg", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0", children: _jsx(ExclamationTriangleIcon, { className: "h-5 w-5 text-red-400" }) }), _jsx("div", { className: "mr-3", children: _jsx("p", { className: "text-sm font-medium text-red-800", children: error }) })] }) })) : (_jsxs(_Fragment, { children: [reportType === 'inventory' && (_jsxs("div", { className: "bg-white shadow-sm rounded-lg overflow-hidden", children: [_jsx("div", { className: "px-4 py-5 sm:p-6", children: _jsx("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between", children: _jsxs("div", { className: "flex items-center space-x-4 space-x-reverse mb-4 sm:mb-0", children: [_jsxs("select", { value: filters.category, onChange: (e) => setFilters({ ...filters, category: e.target.value }), className: "rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm", children: [_jsx("option", { value: "", children: "\u062C\u0645\u064A\u0639 \u0627\u0644\u0641\u0626\u0627\u062A" }), getCategories().map(category => (_jsx("option", { value: category, children: category }, category)))] }), _jsxs("select", { value: filters.stockStatus, onChange: (e) => setFilters({ ...filters, stockStatus: e.target.value }), className: "rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm", children: [_jsx("option", { value: "all", children: "\u062C\u0645\u064A\u0639 \u0627\u0644\u0645\u0646\u062A\u062C\u0627\u062A" }), _jsx("option", { value: "low", children: "\u062A\u062D\u062A \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649" }), _jsx("option", { value: "out", children: "\u0646\u0641\u0630\u062A \u0627\u0644\u0643\u0645\u064A\u0629" })] })] }) }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-300", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "py-3.5 pr-4 pl-3 text-right text-sm font-semibold text-gray-900", children: "\u0627\u0644\u0645\u0646\u062A\u062C" }), _jsx("th", { scope: "col", className: "px-3 py-3.5 text-right text-sm font-semibold text-gray-900", children: "\u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F" }), _jsx("th", { scope: "col", className: "px-3 py-3.5 text-right text-sm font-semibold text-gray-900", children: "\u0627\u0644\u0641\u0626\u0629" }), _jsx("th", { scope: "col", className: "px-3 py-3.5 text-right text-sm font-semibold text-gray-900", children: "\u0627\u0644\u0643\u0645\u064A\u0629" }), _jsx("th", { scope: "col", className: "px-3 py-3.5 text-right text-sm font-semibold text-gray-900", children: "\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649" }), _jsx("th", { scope: "col", className: "px-3 py-3.5 text-right text-sm font-semibold text-gray-900", children: "\u0627\u0644\u0645\u0648\u0642\u0639" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 bg-white", children: filteredProducts.map((product) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsxs("td", { className: "py-4 pr-4 pl-3", children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: product.name }), _jsx("div", { className: "text-sm text-gray-500", children: product.sku })] }), _jsx("td", { className: "px-3 py-4", children: _jsx("div", { className: "text-sm font-mono text-gray-900", children: product.barcode }) }), _jsx("td", { className: "px-3 py-4", children: _jsx("div", { className: "text-sm text-gray-900", children: product.category }) }), _jsx("td", { className: "px-3 py-4", children: _jsx("span", { className: `inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${product.quantity <= product.minimum_quantity
                                                                    ? product.quantity === 0
                                                                        ? 'bg-red-100 text-red-800'
                                                                        : 'bg-yellow-100 text-yellow-800'
                                                                    : 'bg-green-100 text-green-800'}`, children: product.quantity }) }), _jsx("td", { className: "px-3 py-4", children: _jsx("div", { className: "text-sm text-gray-900", children: product.minimum_quantity }) }), _jsx("td", { className: "px-3 py-4", children: _jsx("div", { className: "text-sm text-gray-900", children: product.location ? `${product.location.zone} - ${product.location.rack} - ${product.location.shelf}` : 'غير محدد' }) })] }, product.id))) })] }) }), _jsx("div", { className: "h-96 p-4 border-t border-gray-200", children: _jsx(ResponsiveBar, { data: filteredProducts.map(p => ({
                                            name: p.name,
                                            quantity: p.quantity
                                        })), keys: ['quantity'], indexBy: "name", margin: { top: 50, right: 130, bottom: 50, left: 60 }, padding: 0.3, valueScale: { type: 'linear' }, indexScale: { type: 'band', round: true }, colors: { scheme: 'nivo' }, borderColor: { from: 'color', modifiers: [['darker', 1.6]] }, axisTop: null, axisRight: null, axisBottom: {
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: -45,
                                            legend: 'المنتج',
                                            legendPosition: 'middle',
                                            legendOffset: 45
                                        }, axisLeft: {
                                            tickSize: 5,
                                            tickPadding: 5,
                                            tickRotation: 0,
                                            legend: 'الكمية',
                                            legendPosition: 'middle',
                                            legendOffset: -40
                                        }, labelSkipWidth: 12, labelSkipHeight: 12, labelTextColor: { from: 'color', modifiers: [['darker', 1.6]] }, legends: [
                                            {
                                                dataFrom: 'keys',
                                                anchor: 'bottom-right',
                                                direction: 'column',
                                                justify: false,
                                                translateX: 120,
                                                translateY: 0,
                                                itemsSpacing: 2,
                                                itemWidth: 100,
                                                itemHeight: 20,
                                                itemDirection: 'left-to-right',
                                                itemOpacity: 0.85,
                                                symbolSize: 20,
                                                effects: [
                                                    {
                                                        on: 'hover',
                                                        style: {
                                                            itemOpacity: 1
                                                        }
                                                    }
                                                ]
                                            }
                                        ] }) })] })), reportType === 'users' && (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-300", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "py-3.5 pr-4 pl-3 text-right text-sm font-semibold text-gray-900", children: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" }), _jsx("th", { scope: "col", className: "px-3 py-3.5 text-right text-sm font-semibold text-gray-900", children: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A" }), _jsx("th", { scope: "col", className: "px-3 py-3.5 text-right text-sm font-semibold text-gray-900", children: "\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629" }), _jsx("th", { scope: "col", className: "px-3 py-3.5 text-right text-sm font-semibold text-gray-900", children: "\u0622\u062E\u0631 \u062F\u062E\u0648\u0644" }), _jsx("th", { scope: "col", className: "px-3 py-3.5 text-right text-sm font-semibold text-gray-900", children: "\u0627\u0644\u062D\u0627\u0644\u0629" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 bg-white", children: users.map((user) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "py-4 pr-4 pl-3", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "h-10 w-10 flex-shrink-0", children: _jsx("span", { className: "inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-100", children: _jsx("span", { className: "text-lg font-medium text-primary-700", children: user.name.charAt(0) }) }) }), _jsxs("div", { className: "mr-4", children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: user.name }), _jsx("div", { className: "text-sm text-gray-500", children: user.phone })] })] }) }), _jsx("td", { className: "px-3 py-4 text-sm text-gray-900", children: user.email }), _jsx("td", { className: "px-3 py-4", children: _jsx("span", { className: "inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold text-blue-800", children: user.role }) }), _jsx("td", { className: "px-3 py-4 text-sm text-gray-500", children: user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ar-SA') : 'لم يسجل دخول' }), _jsx("td", { className: "px-3 py-4", children: _jsx("span", { className: `inline-flex rounded-full px-2 text-xs font-semibold ${user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`, children: user.active ? 'نشط' : 'غير نشط' }) })] }, user.id))) })] }) }))] })) })] }));
};
