import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { supabase } from '../../config/supabaseClient';
import { PencilIcon, TrashIcon, UserPlusIcon as UserAddIcon, LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';
import { Dialog } from '@mui/material';
export const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        role: 'employee'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    useEffect(() => {
        fetchUsers();
    }, []);
    const fetchUsers = async () => {
        const { data: usersData, error: usersError } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        const { data: authData } = await supabase
            .auth.admin.listUsers();
        // استخدام getSession للتحقق من الجلسة الحالية
        const { data: currentSession } = await supabase.auth.getSession();
        console.log('Current Session:', currentSession);
        if (!usersError && usersData) {
            const updatedUsers = usersData.map(user => {
                const authUser = authData?.users?.find(auth => auth.id === user.id);
                const isOnline = currentSession?.session?.user.id === user.id;
                console.log(`User ${user.email} session:`, isOnline);
                return {
                    ...user,
                    active: user.active ?? true,
                    last_sign_in_at: authUser?.last_sign_in_at,
                    isOnline
                };
            });
            setUsers(updatedUsers);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const cleanEmail = formData.email.trim().toLowerCase();
        try {
            if (editingUser) {
                await handleEdit(editingUser);
            }
            else {
                const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                    email: cleanEmail,
                    password: formData.password,
                    email_confirm: true,
                    user_metadata: {
                        name: formData.name.trim(),
                        role: formData.role,
                        active: true
                    }
                });
                if (authError)
                    throw authError;
                if (authData.user) {
                    const { error: profileError } = await supabase
                        .from('users')
                        .insert([{
                            id: authData.user.id,
                            name: formData.name.trim(),
                            email: cleanEmail,
                            role: formData.role,
                            active: true
                        }]);
                    if (profileError)
                        throw profileError;
                }
                setSuccess('تم إنشاء المستخدم بنجاح');
                setOpenDialog(false);
                await fetchUsers();
            }
        }
        catch (error) {
            console.error('Error:', error);
            setError(error.message || 'حدث خطأ أثناء معالجة الطلب');
        }
    };
    const handleDelete = async (id) => {
        if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
            try {
                // حذف المستخدم من جدول المستخدمين أولاً
                const { error: profileError } = await supabase
                    .from('users')
                    .delete()
                    .eq('id', id);
                if (profileError)
                    throw profileError;
                // ثم حذف المستخدم من Auth
                const { error: authError } = await supabase.auth.admin.deleteUser(id);
                if (authError) {
                    // إذا فشل حذف المستخدم من Auth، نعيد إضافته للجدول
                    console.error('Auth deletion failed:', authError);
                    throw new Error('فشل حذف المستخدم من النظام');
                }
                setSuccess('تم حذف المستخدم بنجاح');
                await fetchUsers();
            }
            catch (error) {
                console.error('Error:', error);
                // رسائل خطأ أكثر تفصيلاً
                if (error.message.includes('foreign key')) {
                    setError('لا يمكن حذف المستخدم لوجود بيانات مرتبطة به');
                }
                else if (error.message.includes('not found')) {
                    setError('المستخدم غير موجود');
                }
                else {
                    setError(error.message || 'فشل حذف المستخدم');
                }
                // محاولة استعادة البيانات في حالة الفشل
                await fetchUsers();
            }
        }
    };
    const handleEdit = async (user) => {
        try {
            setError('');
            setSuccess('');
            // تحديث بيانات المستخدم في Auth
            const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
                email: formData.email.trim().toLowerCase(),
                password: formData.password || undefined,
                user_metadata: {
                    name: formData.name.trim(),
                    role: formData.role,
                    active: user.active
                }
            });
            if (updateError)
                throw updateError;
            // تحديث بيانات المستخدم في الجدول
            const { error: profileError } = await supabase
                .from('users')
                .update({
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                role: formData.role,
                active: true
            })
                .eq('id', user.id);
            if (profileError)
                throw profileError;
            setSuccess('تم تحديث المستخدم بنجاح');
            setOpenDialog(false);
            await fetchUsers();
        }
        catch (error) {
            console.error('Error updating user:', error);
            if (error.message.includes('duplicate key')) {
                setError('البريد الإلكتروني مستخدم بالفعل');
            }
            else if (error.message.includes('invalid email')) {
                setError('البريد الإلكتروني غير صالح');
            }
            else if (error.message.includes('password')) {
                setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            }
            else {
                setError(error.message || 'حدث خطأ أثناء تحديث المستخدم');
            }
        }
    };
    const handleToggleStatus = async (id, active) => {
        try {
            // تحديث حالة المستخدم في Auth metadata
            const { error: authError } = await supabase.auth.admin.updateUserById(id, {
                user_metadata: {
                    active: active
                }
            });
            if (authError)
                throw authError;
            // تحديث حالة المستخدم في الجدول
            const { error: profileError } = await supabase
                .from('users')
                .update({ active: active })
                .eq('id', id);
            if (profileError)
                throw profileError;
            await fetchUsers();
            setSuccess(active ? 'تم تنشيط المستخدم بنجاح' : 'تم إلغاء تنشيط المستخدم بنجاح');
        }
        catch (error) {
            console.error('Error:', error);
            setError(`فشل تغيير حالة المستخدم: ${error.message}`);
        }
    };
    const handleOpenDialog = (user) => {
        if (user) {
            setFormData({
                email: user.email,
                password: '',
                name: user.name,
                role: user.role
            });
            setEditingUser(user);
        }
        else {
            setFormData({
                email: '',
                password: '',
                name: '',
                role: 'employee'
            });
            setEditingUser(null);
        }
        setOpenDialog(true);
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "sm:flex sm:items-center justify-between py-6", children: [_jsx("div", { className: "sm:flex-auto", children: _jsx("h1", { className: "text-2xl lg:text-3xl font-bold text-gray-900", children: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645\u064A\u0646" }) }), _jsx("div", { className: "mt-4 sm:mt-0", children: _jsxs("button", { onClick: () => handleOpenDialog(null), className: "w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-5 py-2.5 text-base font-medium text-white shadow-sm hover:bg-primary-700 transition-colors", children: [_jsx(UserAddIcon, { className: "h-5 w-5 ml-2" }), "\u0625\u0636\u0627\u0641\u0629 \u0645\u0633\u062A\u062E\u062F\u0645"] }) })] }), error && (_jsx("div", { className: "rounded-md bg-red-50 p-4 mb-6", children: _jsx("div", { className: "flex", children: _jsx("div", { className: "mr-3", children: _jsx("div", { className: "text-base font-medium text-red-800", children: error }) }) }) })), _jsx("div", { className: "hidden md:block mt-4", children: _jsx("div", { className: "overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-300", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "py-4 pr-4 pl-3 text-right text-base font-semibold text-gray-900 w-1/4", children: "\u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900 w-1/4", children: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900 w-1/5", children: "\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900 w-1/5", children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsx("th", { scope: "col", className: "relative py-4 pl-3 pr-4 w-24", children: _jsx("span", { className: "sr-only", children: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A" }) })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 bg-white", children: users.map((user) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "whitespace-nowrap py-4 pr-4 pl-3", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "h-10 w-10 flex-shrink-0", children: _jsx("span", { className: "inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-500", children: _jsx("span", { className: "text-lg font-medium leading-none text-white", children: user.name.charAt(0) }) }) }), _jsxs("div", { className: "mr-4", children: [_jsx("div", { className: "text-base font-semibold text-gray-900", children: user.name }), _jsx("div", { className: "text-sm text-gray-500", children: user.last_sign_in_at ? (_jsxs("span", { children: ["\u0622\u062E\u0631 \u062F\u062E\u0648\u0644: ", new Date(user.last_sign_in_at).toLocaleString('ar-SA', {
                                                                            year: 'numeric',
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })] })) : 'لم يسجل الدخول بعد' })] })] }) }), _jsx("td", { className: "whitespace-nowrap px-3 py-4 text-sm text-gray-900", children: user.email }), _jsx("td", { className: "whitespace-nowrap px-3 py-4", children: _jsx("span", { className: "inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800", children: user.role }) }), _jsx("td", { className: "whitespace-nowrap px-3 py-4", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`, children: user.active ? 'نشط' : 'غير نشط' }), _jsx("span", { className: `inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${user.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`, children: user.isOnline ? 'متصل' : 'غير متصل' })] }) }), _jsx("td", { className: "relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium", children: _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { onClick: () => handleOpenDialog(user), className: "text-primary-600 hover:text-primary-900 transition-colors", children: _jsx(PencilIcon, { className: "h-5 w-5" }) }), _jsx("button", { onClick: () => handleDelete(user.id), className: "text-red-600 hover:text-red-900 transition-colors", children: _jsx(TrashIcon, { className: "h-5 w-5" }) }), _jsx("button", { onClick: () => handleToggleStatus(user.id, !user.active), className: "text-gray-600 hover:text-gray-900 transition-colors", children: user.active ? (_jsx(LockClosedIcon, { className: "h-5 w-5" })) : (_jsx(LockOpenIcon, { className: "h-5 w-5" })) })] }) })] }, user.id))) })] }) }) }), _jsx("div", { className: "md:hidden space-y-4 mt-4", children: users.map((user) => (_jsxs("div", { className: "bg-white shadow-sm border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-500", children: _jsx("span", { className: "text-xl font-medium text-white", children: user.name.charAt(0) }) }), _jsxs("div", { className: "mr-3", children: [_jsx("div", { className: "text-lg font-semibold text-gray-900", children: user.name }), _jsx("div", { className: "text-sm text-gray-500", children: user.last_sign_in_at ? (_jsxs("span", { children: ["\u0622\u062E\u0631 \u062F\u062E\u0648\u0644: ", new Date(user.last_sign_in_at).toLocaleString('ar-SA', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })] })) : 'لم يسجل الدخول بعد' })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleOpenDialog(user), className: "p-1.5 rounded-full text-primary-600 hover:bg-primary-50", children: _jsx(PencilIcon, { className: "h-5 w-5" }) }), _jsx("button", { onClick: () => handleDelete(user.id), className: "p-1.5 rounded-full text-red-600 hover:bg-red-50", children: _jsx(TrashIcon, { className: "h-5 w-5" }) }), _jsx("button", { onClick: () => handleToggleStatus(user.id, !user.active), className: "p-1.5 rounded-full text-gray-600 hover:bg-gray-50", children: user.active ? (_jsx(LockClosedIcon, { className: "h-5 w-5" })) : (_jsx(LockOpenIcon, { className: "h-5 w-5" })) })] })] }), _jsxs("div", { className: "mt-4 space-y-3", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-500", children: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: user.email })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-500", children: "\u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629" }), _jsx("span", { className: "inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800", children: user.role })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-500", children: "\u0627\u0644\u062D\u0627\u0644\u0629" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("span", { className: `inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`, children: user.active ? 'نشط' : 'غير نشط' }), _jsx("span", { className: `inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${user.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`, children: user.isOnline ? 'متصل' : 'غير متصل' })] })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-sm text-gray-500", children: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0625\u0646\u0634\u0627\u0621" }), _jsx("span", { className: "text-sm text-gray-900", children: new Date(user.created_at).toLocaleString('ar-SA', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            }) })] })] })] }, user.id))) }), _jsx(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), maxWidth: "sm", fullWidth: true, keepMounted: false, disablePortal: false, "aria-labelledby": "user-dialog-title", children: _jsxs("div", { className: "bg-white px-4 pt-5 pb-4 sm:p-6", children: [_jsx("div", { className: "mb-5", children: _jsx("h3", { className: "text-lg lg:text-xl font-bold text-gray-900", children: editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد' }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0627\u0644\u0628\u0631\u064A\u062F \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A" }), _jsx("input", { type: "email", id: "email", value: formData.email, onChange: (e) => setFormData({ ...formData, email: e.target.value }), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm", required: !editingUser, disabled: !!editingUser })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631" }), _jsx("input", { type: "password", id: "password", value: formData.password, onChange: (e) => setFormData({ ...formData, password: e.target.value }), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm", required: !editingUser }), editingUser && (_jsx("p", { className: "mt-1 text-sm text-gray-500", children: "\u0627\u062A\u0631\u0643\u0647\u0627 \u0641\u0627\u0631\u063A\u0629 \u0625\u0630\u0627 \u0644\u0645 \u062A\u0631\u062F \u062A\u063A\u064A\u064A\u0631\u0647\u0627" }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0627\u0644\u0627\u0633\u0645" }), _jsx("input", { type: "text", id: "name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "role", className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0627\u0644\u062F\u0648\u0631" }), _jsxs("select", { id: "role", value: formData.role, onChange: (e) => setFormData({ ...formData, role: e.target.value }), className: "block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm", required: true, children: [_jsx("option", { value: "admin", children: "\u0645\u062F\u064A\u0631" }), _jsx("option", { value: "supervisor", children: "\u0645\u0634\u0631\u0641" }), _jsx("option", { value: "employee", children: "\u0645\u0648\u0638\u0641" })] })] }), _jsxs("div", { className: "mt-6 sm:mt-8 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3", children: [_jsx("button", { type: "submit", className: "inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2.5 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors sm:col-start-2 sm:text-sm", children: editingUser ? 'تحديث' : 'إضافة' }), _jsx("button", { type: "button", onClick: () => setOpenDialog(false), className: "mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors sm:col-start-1 sm:mt-0 sm:text-sm", children: "\u0625\u0644\u063A\u0627\u0621" })] })] })] }) })] }));
};
