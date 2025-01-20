import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { PlusIcon, ArrowUturnLeftIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
export const CustodyManagement = () => {
    const supabase = useSupabaseClient();
    const { session } = useAuth();
    const isAdmin = session?.user?.app_metadata?.role === 'admin';
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [formData, setFormData] = useState({
        product_id: '',
        quantity: 1,
        assigned_to: '',
        notes: ''
    });
    useEffect(() => {
        fetchCustodyItems();
        fetchProducts();
    }, []);
    const fetchCustodyItems = async () => {
        // أولاً نجلب العهد
        const { data: custodyData, error: custodyError } = await supabase
            .from('custody')
            .select('*')
            .order('created_at', { ascending: false });
        if (custodyError) {
            console.error('Error fetching custody items:', custodyError);
            return;
        }
        // ثم نجلب معلومات المستخدمين
        const userIds = custodyData.reduce((acc, item) => {
            if (item.assigned_to)
                acc.push(item.assigned_to);
            if (item.approved_by)
                acc.push(item.approved_by);
            return acc;
        }, []);
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, name')
            .in('id', [...new Set(userIds)]);
        if (userError) {
            console.error('Error fetching users:', userError);
            return;
        }
        // ندمج البيانات
        const items = custodyData.map(item => ({
            ...item,
            assignee: userData.find(user => user.id === item.assigned_to),
            approver: userData.find(user => user.id === item.approved_by)
        }));
        setItems(items);
    };
    const fetchProducts = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .gt('quantity', 0)
            .order('name');
        if (error) {
            console.error('Error fetching products:', error);
            return;
        }
        setProducts(data || []);
    };
    const handleSubmit = async () => {
        const selectedProduct = products.find(p => p.id === formData.product_id);
        if (!selectedProduct || formData.quantity > selectedProduct.quantity) {
            alert('الكمية المطلوبة غير متوفرة');
            return;
        }
        const { error: custodyError } = await supabase
            .from('custody')
            .insert([{
                item_name: selectedProduct.name,
                quantity: formData.quantity,
                assigned_to: formData.assigned_to,
                notes: formData.notes,
                status: 'pending',
                created_by: session?.user?.id,
                created_at: new Date().toISOString()
            }]);
        if (custodyError) {
            console.error('Error adding custody:', custodyError);
            return;
        }
        setOpen(false);
        setFormData({
            product_id: '',
            quantity: 1,
            assigned_to: '',
            notes: ''
        });
        fetchCustodyItems();
        fetchProducts();
    };
    const handleStatusChange = async (id, status) => {
        // أولاً نجلب معلومات العهدة
        const { data: custodyItem } = await supabase
            .from('custody')
            .select('*')
            .eq('id', id)
            .single();
        if (!custodyItem)
            return;
        // نجلب معلومات المنتج باستخدام اسم المنتج
        const { data: product } = await supabase
            .from('products')
            .select('id, quantity')
            .eq('name', custodyItem.item_name)
            .single();
        if (!product)
            return;
        // نقوم بتحديث حالة العهدة
        const { error: custodyError } = await supabase
            .from('custody')
            .update({ status })
            .eq('id', id);
        if (custodyError) {
            console.error('Error updating status:', custodyError);
            return;
        }
        // إذا تم الإرجاع، نقوم بتحديث كمية المنتج
        if (status === 'returned') {
            const { error: productError } = await supabase
                .from('products')
                .update({
                quantity: product.quantity + custodyItem.quantity
            })
                .eq('id', product.id);
            if (productError) {
                console.error('Error updating product quantity:', productError);
                return;
            }
        }
        fetchCustodyItems();
        fetchProducts();
    };
    const handleApproval = async (id, newStatus) => {
        const { data: custodyItem } = await supabase
            .from('custody')
            .select('*')
            .eq('id', id)
            .single();
        if (!custodyItem)
            return;
        // تحديث حالة العهدة
        const { error: custodyError } = await supabase
            .from('custody')
            .update({
            status: newStatus,
            approved_by: session?.user?.id,
            approved_at: new Date().toISOString()
        })
            .eq('id', id);
        if (custodyError) {
            console.error('Error updating custody status:', custodyError);
            return;
        }
        // إذا تمت الموافقة، نقوم بتحديث كمية المنتج
        if (newStatus === 'active') {
            const { data: product } = await supabase
                .from('products')
                .select('id, quantity')
                .eq('name', custodyItem.item_name)
                .single();
            if (!product)
                return;
            const { error: productError } = await supabase
                .from('products')
                .update({
                quantity: product.quantity - custodyItem.quantity
            })
                .eq('id', product.id);
            if (productError) {
                console.error('Error updating product quantity:', productError);
                return;
            }
        }
        fetchCustodyItems();
        fetchProducts();
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "sm:flex sm:items-center justify-between py-6", children: [_jsx("div", { className: "sm:flex-auto", children: _jsx("h1", { className: "text-2xl lg:text-3xl font-bold text-gray-900", children: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0639\u0647\u062F" }) }), _jsx("div", { className: "mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3", children: _jsxs("button", { onClick: () => {
                                setFormData({
                                    product_id: '',
                                    quantity: 1,
                                    assigned_to: '',
                                    notes: ''
                                });
                                setOpen(true);
                            }, className: "w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-5 py-2.5 text-base font-medium text-white shadow-sm hover:bg-primary-700 transition-colors", children: [_jsx(PlusIcon, { className: "h-5 w-5 ml-2" }), "\u0625\u0636\u0627\u0641\u0629 \u0639\u0647\u062F\u0629"] }) })] }), _jsx("div", { className: "hidden md:block mt-4", children: _jsx("div", { className: "overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-300", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "py-4 pr-4 pl-3 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u0635\u0646\u0641" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u0645\u0633\u062A\u0644\u0645" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900", children: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062A\u0633\u0644\u064A\u0645" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A" }), _jsx("th", { scope: "col", className: "relative py-4 pl-3 pr-4 w-24", children: _jsx("span", { className: "sr-only", children: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A" }) })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 bg-white", children: items.map((item) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "py-4 pr-4 pl-3", children: _jsx("div", { className: "text-base font-medium text-gray-900", children: item.item_name }) }), _jsx("td", { className: "px-3 py-4", children: _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100", children: _jsx("span", { className: "text-sm font-medium text-primary-700", children: item.assignee?.name.charAt(0) }) }), _jsx("div", { className: "mr-3", children: _jsx("div", { className: "text-sm font-medium text-gray-900", children: item.assignee?.name }) })] }) }), _jsx("td", { className: "px-3 py-4 text-sm text-gray-500", children: new Date(item.created_at).toLocaleDateString('ar-SA') }), _jsx("td", { className: "px-3 py-4", children: _jsx("span", { className: `inline-flex rounded-full px-2 text-xs font-semibold ${item.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                                    item.status === 'returned' ? 'bg-gray-100 text-gray-800' :
                                                        'bg-yellow-100 text-yellow-800'}`, children: item.status === 'active' ? 'نشط' :
                                                    item.status === 'returned' ? 'مرجع' : 'معطل' }) }), _jsx("td", { className: "px-3 py-4 text-sm text-gray-500", children: item.status === 'pending' ? (_jsx("span", { className: "text-yellow-600", children: "\u0641\u064A \u0627\u0646\u062A\u0638\u0627\u0631 \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629" })) : item.status === 'rejected' ? (_jsx("span", { className: "text-red-600", children: "\u062A\u0645 \u0627\u0644\u0631\u0641\u0636" })) : item.status === 'active' ? (_jsxs("div", { children: [_jsx("span", { className: "text-green-600", children: "\u062A\u0645\u062A \u0627\u0644\u0645\u0648\u0627\u0641\u0642\u0629" }), item.approved_by && item.approved_at && (_jsxs("div", { className: "text-xs text-gray-500 mt-1", children: ["\u0628\u0648\u0627\u0633\u0637\u0629: ", item.approver?.name, _jsx("br", {}), new Date(item.approved_at).toLocaleDateString('ar-SA')] }))] })) : ('-') }), _jsx("td", { className: "px-3 py-4 text-sm text-gray-500", children: item.notes || '-' }), _jsx("td", { className: "py-4 pl-3 pr-4 text-right text-sm", children: _jsxs("div", { className: "flex items-center justify-end gap-2", children: [isAdmin && item.status === 'pending' && (_jsxs(_Fragment, { children: [_jsx("button", { onClick: () => handleApproval(item.id, 'active'), className: "p-1.5 rounded-full text-green-600 hover:bg-green-50", title: "\u0645\u0648\u0627\u0641\u0642\u0629", children: _jsx(CheckIcon, { className: "h-5 w-5" }) }), _jsx("button", { onClick: () => handleApproval(item.id, 'rejected'), className: "p-1.5 rounded-full text-red-600 hover:bg-red-50", title: "\u0631\u0641\u0636", children: _jsx(XMarkIcon, { className: "h-5 w-5" }) })] })), item.status === 'active' && (_jsx("button", { onClick: () => handleStatusChange(item.id, 'returned'), className: "p-1.5 rounded-full text-green-600 hover:bg-green-50", title: "\u0625\u0631\u062C\u0627\u0639", children: _jsx(ArrowUturnLeftIcon, { className: "h-5 w-5" }) }))] }) })] }, item.id))) })] }) }) }), _jsx("div", { className: "md:hidden space-y-4 mt-4", children: items.map((item) => (_jsxs("div", { className: "bg-white shadow-sm border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsx("div", { children: _jsx("div", { className: "text-lg font-semibold text-gray-900", children: item.item_name }) }), _jsx("div", { className: "flex gap-2", children: item.status === 'active' && (_jsx("button", { onClick: () => handleStatusChange(item.id, 'returned'), className: "p-1.5 rounded-full text-green-600 hover:bg-green-50", children: _jsx(ArrowUturnLeftIcon, { className: "h-5 w-5" }) })) })] }), _jsxs("div", { className: "mt-4 space-y-3", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100", children: _jsx("span", { className: "text-sm font-medium text-primary-700", children: item.assignee?.name.charAt(0) }) }), _jsx("div", { className: "mr-3", children: _jsx("div", { className: "text-sm font-medium text-gray-900", children: item.assignee?.name }) })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-500", children: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062A\u0633\u0644\u064A\u0645" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: new Date(item.created_at).toLocaleDateString('ar-SA') })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-500", children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsx("span", { className: `inline-flex rounded-full px-2 text-xs font-semibold ${item.status === 'active' ? 'bg-blue-100 text-blue-800' :
                                                item.status === 'returned' ? 'bg-gray-100 text-gray-800' :
                                                    'bg-yellow-100 text-yellow-800'}`, children: item.status === 'active' ? 'نشط' :
                                                item.status === 'returned' ? 'مرجع' : 'معطل' })] }), item.notes && (_jsx("div", { className: "border-t pt-3 mt-3", children: _jsx("div", { className: "text-sm text-gray-500", children: item.notes }) }))] })] }, item.id))) }), _jsxs(Dialog, { open: open, onClose: () => setOpen(false), "aria-labelledby": "custody-dialog-title", disableEnforceFocus: true, keepMounted: false, children: [_jsx(DialogTitle, { id: "custody-dialog-title", children: "\u0625\u0636\u0627\u0641\u0629 \u0639\u0647\u062F\u0629 \u062C\u062F\u064A\u062F\u0629" }), _jsxs(DialogContent, { children: [_jsxs(FormControl, { fullWidth: true, margin: "dense", children: [_jsx(InputLabel, { children: "\u0627\u0644\u0645\u0646\u062A\u062C" }), _jsx(Select, { value: formData.product_id, onChange: (e) => setFormData({ ...formData, product_id: e.target.value }), children: products.map((product) => (_jsx(MenuItem, { value: product.id, children: _jsxs("div", { className: "flex justify-between items-center w-full", children: [_jsx("span", { children: product.name }), _jsxs("span", { className: "text-sm text-gray-500", children: ["(\u0645\u062A\u0648\u0641\u0631: ", product.quantity, ")"] })] }) }, product.id))) })] }), _jsx(TextField, { margin: "dense", label: "\u0627\u0644\u0643\u0645\u064A\u0629", type: "number", fullWidth: true, value: formData.quantity, onChange: (e) => {
                                    const value = parseInt(e.target.value);
                                    const selectedProduct = products.find(p => p.id === formData.product_id);
                                    if (selectedProduct && value > selectedProduct.quantity) {
                                        alert('الكمية المطلوبة أكبر من المتوفر');
                                        return;
                                    }
                                    setFormData({ ...formData, quantity: value });
                                }, inputProps: { min: 1 } }), _jsxs(FormControl, { fullWidth: true, margin: "dense", children: [_jsx(InputLabel, { children: "\u0627\u0644\u0645\u0633\u062A\u0644\u0645" }), _jsx(Select, { value: formData.assigned_to, onChange: (e) => setFormData({ ...formData, assigned_to: e.target.value }), children: users.map((user) => (_jsx(MenuItem, { value: user.id, children: user.name }, user.id))) })] }), _jsx(TextField, { margin: "dense", label: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A", fullWidth: true, multiline: true, rows: 3, value: formData.notes, onChange: (e) => setFormData({ ...formData, notes: e.target.value }) })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: () => setOpen(false), children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx(Button, { onClick: handleSubmit, variant: "contained", disabled: !formData.product_id || !formData.assigned_to, children: "\u062D\u0641\u0638" })] })] })] }));
};
