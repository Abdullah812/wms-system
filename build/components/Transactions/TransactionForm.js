import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { PlusIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { BarcodeScanner } from '../Products/BarcodeScanner';
export const TransactionForm = () => {
    const [transactions, setTransactions] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { session } = useAuth();
    const [formData, setFormData] = useState({
        product_id: '',
        type: 'in',
        quantity: 1,
        amount: 0,
        receiver: '',
        sender: '',
        notes: ''
    });
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [users, setUsers] = useState([]);
    useEffect(() => {
        fetchTransactions();
        fetchUsers();
    }, []);
    const fetchTransactions = async () => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select(`
          *,
          product:product_id(name, sku, barcode),
          creator:created_by(name)
        `)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            setTransactions(data || []);
        }
        catch (error) {
            console.error('Error fetching transactions:', error);
            setError('حدث خطأ في جلب المعاملات');
        }
    };
    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, name')
                .eq('active', true)
                .order('name');
            if (error)
                throw error;
            setUsers(data || []);
        }
        catch (error) {
            console.error('Error fetching users:', error);
        }
    };
    const handleBarcodeScan = async (barcode) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('barcode', barcode)
                .single();
            if (error)
                throw error;
            if (data) {
                setSelectedProduct(data);
                setFormData(prev => ({ ...prev, product_id: data.id }));
                setOpenDialog(true);
            }
            else {
                setError('لم يتم العثور على المنتج');
            }
        }
        catch (error) {
            console.error('Error finding product:', error);
            setError('حدث خطأ في البحث عن المنتج');
        }
        setShowScanner(false);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            // 1. إنشاء المعاملة
            const { error: transactionError } = await supabase
                .from('transactions')
                .insert([{
                    ...formData,
                    created_by: session?.user.id,
                    created_at: new Date().toISOString()
                }]);
            if (transactionError)
                throw transactionError;
            // 2. تحديث كمية المنتج
            const quantityChange = formData.type === 'in' ? formData.quantity : -formData.quantity;
            const { error: productError } = await supabase
                .from('products')
                .update({
                quantity: selectedProduct.quantity + quantityChange,
                updated_by: session?.user.id,
                updated_at: new Date().toISOString()
            })
                .eq('id', formData.product_id);
            if (productError)
                throw productError;
            setSuccess('تم تسجيل المعاملة بنجاح');
            setOpenDialog(false);
            setFormData({
                product_id: '',
                type: 'in',
                quantity: 1,
                amount: 0,
                receiver: '',
                sender: '',
                notes: ''
            });
            setSelectedProduct(null);
            fetchTransactions();
        }
        catch (error) {
            setError(error.message);
        }
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "sm:flex sm:items-center justify-between py-6", children: [_jsx("div", { className: "sm:flex-auto", children: _jsx("h1", { className: "text-2xl lg:text-3xl font-bold text-gray-900", children: "\u0633\u062C\u0644 \u0627\u0644\u062D\u0631\u0643\u0629" }) }), _jsxs("div", { className: "mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3", children: [_jsxs("button", { onClick: () => {
                                    setSelectedProduct(null);
                                    setFormData({
                                        product_id: '',
                                        type: 'in',
                                        quantity: 1,
                                        amount: 0,
                                        receiver: '',
                                        sender: '',
                                        notes: ''
                                    });
                                    setOpenDialog(true);
                                }, className: "w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-5 py-2.5 text-base font-medium text-white shadow-sm hover:bg-primary-700 transition-colors", children: [_jsx(PlusIcon, { className: "h-5 w-5 ml-2" }), "\u0625\u0636\u0627\u0641\u0629 \u062D\u0631\u0643\u0629"] }), _jsxs("button", { onClick: () => setShowScanner(true), className: "w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors", children: [_jsx(QrCodeIcon, { className: "h-5 w-5 ml-2" }), "\u0645\u0633\u062D \u0628\u0627\u0631\u0643\u0648\u062F"] })] })] }), error && (_jsx("div", { className: "rounded-md bg-red-50 p-4 mb-6", children: _jsx("div", { className: "flex", children: _jsx("div", { className: "mr-3", children: _jsx("div", { className: "text-base font-medium text-red-800", children: error }) }) }) })), success && (_jsx("div", { className: "rounded-md bg-green-50 p-4 mb-6", children: _jsx("div", { className: "flex", children: _jsx("div", { className: "mr-3", children: _jsx("div", { className: "text-base font-medium text-green-800", children: success }) }) }) })), _jsx("div", { className: "mt-4 -mx-4 sm:mx-0", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("div", { className: "inline-block min-w-full align-middle", children: [_jsx("div", { className: "hidden md:block", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-300", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "py-4 pr-4 pl-3 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u0635\u0646\u0641" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u0648\u062D\u062F\u0629" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u0643\u0645\u064A\u0629" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u0645\u0628\u0644\u063A" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u0645\u0633\u062A\u0644\u0645" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u0645\u0633\u0644\u0645" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u062D\u0627\u0644\u0629" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 bg-white", children: transactions.map((transaction) => (_jsxs("tr", { children: [_jsx("td", { className: "whitespace-nowrap py-4 pr-4 pl-3 text-base text-gray-900", children: transaction.product.barcode }), _jsx("td", { className: "whitespace-nowrap px-3 py-4 text-base text-gray-900", children: transaction.product.name }), _jsx("td", { className: "whitespace-nowrap px-3 py-4 text-base text-gray-500", children: transaction.product.unit }), _jsx("td", { className: "whitespace-nowrap px-3 py-4 text-base text-gray-500", children: transaction.quantity }), _jsx("td", { className: "whitespace-nowrap px-3 py-4 text-base text-gray-500", children: transaction.amount || '-' }), _jsx("td", { className: "whitespace-nowrap px-3 py-4 text-base text-gray-500", children: transaction.receiver || '-' }), _jsx("td", { className: "whitespace-nowrap px-3 py-4 text-base text-gray-500", children: transaction.sender || '-' }), _jsx("td", { className: "whitespace-nowrap px-3 py-4", children: _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`, children: transaction.type === 'in' ? 'وارد' : 'صادر' }) })] }, transaction.id))) })] }) }), _jsx("div", { className: "md:hidden", children: transactions.map((transaction) => (_jsxs("div", { className: "bg-white shadow rounded-lg mb-4 p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-2", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium text-gray-900", children: transaction.product.name }), _jsx("p", { className: "text-sm text-gray-500", children: transaction.product.sku })] }), _jsx("span", { className: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${transaction.type === 'in'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'}`, children: transaction.type === 'in' ? 'وارد' : 'صادر' })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "\u0627\u0644\u0643\u0645\u064A\u0629:" }), _jsx("span", { className: "font-medium mr-1", children: transaction.quantity })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "\u0627\u0644\u062A\u0627\u0631\u064A\u062E:" }), _jsx("span", { className: "font-medium mr-1", children: new Date(transaction.created_at).toLocaleString('ar-SA') })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "\u0645\u0646 \u0645\u0648\u0642\u0639:" }), _jsx("span", { className: "font-medium mr-1", children: transaction.from_location || '-' })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "\u0625\u0644\u0649 \u0645\u0648\u0642\u0639:" }), _jsx("span", { className: "font-medium mr-1", children: transaction.to_location || '-' })] }), transaction.notes && (_jsxs("div", { className: "col-span-2", children: [_jsx("span", { className: "text-gray-500", children: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A:" }), _jsx("span", { className: "font-medium mr-1", children: transaction.notes })] })), _jsxs("div", { className: "col-span-2", children: [_jsx("span", { className: "text-gray-500", children: "\u0628\u0648\u0627\u0633\u0637\u0629:" }), _jsx("span", { className: "font-medium mr-1", children: transaction.creator?.name })] })] })] }, transaction.id))) })] }) }) }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), maxWidth: "sm", fullWidth: true, fullScreen: window.innerWidth < 640, keepMounted: false, disablePortal: false, "aria-labelledby": "transaction-dialog-title", children: [_jsx(DialogTitle, { id: "transaction-dialog-title", className: "text-xl font-semibold border-b pb-4", children: "\u062A\u0633\u062C\u064A\u0644 \u062D\u0631\u0643\u0629 \u062C\u062F\u064A\u062F\u0629" }), _jsx(DialogContent, { className: "mt-4", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [!selectedProduct && (_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "\u0628\u062D\u062B \u0639\u0646 \u0635\u0646\u0641" }), _jsx("input", { type: "text", placeholder: "\u0627\u062F\u062E\u0644 \u0627\u0633\u0645 \u0627\u0644\u0635\u0646\u0641 \u0623\u0648 \u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F", onChange: async (e) => {
                                                try {
                                                    const { data, error } = await supabase
                                                        .from('products')
                                                        .select('*')
                                                        .or(`name.ilike.%${e.target.value}%,barcode.eq.${e.target.value},sku.ilike.%${e.target.value}%`)
                                                        .single();
                                                    if (data) {
                                                        setSelectedProduct(data);
                                                        setFormData(prev => ({ ...prev, product_id: data.id }));
                                                    }
                                                }
                                                catch (error) {
                                                    console.error('Error searching product:', error);
                                                }
                                            }, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" })] })), selectedProduct && (_jsxs(_Fragment, { children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u0635\u0646\u0641" }), _jsxs("p", { className: "mt-1", children: [selectedProduct.name, _jsx("span", { className: "text-sm text-gray-500 block", children: selectedProduct.sku })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u0643\u0645\u064A\u0629" }), _jsx("input", { type: "number", min: "1", value: formData.quantity, onChange: (e) => setFormData({ ...formData, quantity: parseInt(e.target.value) }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u0645\u0628\u0644\u063A" }), _jsx("input", { type: "number", step: "0.01", value: formData.amount || '', onChange: (e) => setFormData({ ...formData, amount: parseFloat(e.target.value) }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u0645\u0633\u062A\u0644\u0645" }), _jsxs("select", { value: formData.receiver || '', onChange: (e) => setFormData({ ...formData, receiver: e.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm", children: [_jsx("option", { value: "", children: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u0633\u062A\u0644\u0645" }), users.map(user => (_jsx("option", { value: user.id, children: user.name }, user.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u0645\u0633\u0644\u0645" }), _jsxs("select", { value: formData.sender || '', onChange: (e) => setFormData({ ...formData, sender: e.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm", children: [_jsx("option", { value: "", children: "\u0627\u062E\u062A\u0631 \u0627\u0644\u0645\u0633\u0644\u0645" }), users.map(user => (_jsx("option", { value: user.id, children: user.name }, user.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsxs("select", { value: formData.type, onChange: (e) => setFormData({ ...formData, type: e.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm", children: [_jsx("option", { value: "in", children: "\u0648\u0627\u0631\u062F" }), _jsx("option", { value: "out", children: "\u0635\u0627\u062F\u0631" })] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A" }), _jsx("textarea", { value: formData.notes, onChange: (e) => setFormData({ ...formData, notes: e.target.value }), rows: 3, className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" })] }), _jsxs("div", { className: "mt-6 flex justify-end space-x-3 space-x-reverse", children: [_jsx("button", { type: "button", onClick: () => setOpenDialog(false), className: "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50", children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx("button", { type: "submit", className: "inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700", children: "\u062D\u0641\u0638" })] })] }))] }) })] }), _jsxs(Dialog, { open: showScanner, onClose: () => setShowScanner(false), keepMounted: false, disablePortal: false, "aria-labelledby": "scanner-dialog-title", children: [_jsx(DialogTitle, { id: "scanner-dialog-title", children: "\u0645\u0633\u062D \u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F" }), _jsx(DialogContent, { children: _jsx(BarcodeScanner, { onScan: handleBarcodeScan, onError: (error) => {
                                setError(error);
                                setShowScanner(false);
                            } }) })] })] }));
};
