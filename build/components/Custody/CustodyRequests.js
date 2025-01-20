import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useAuth } from '../../contexts/AuthContext';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
export const CustodyRequests = () => {
    const supabase = useSupabaseClient();
    const { session } = useAuth();
    const [requests, setRequests] = useState([]);
    useEffect(() => {
        fetchPendingRequests();
    }, []);
    const fetchPendingRequests = async () => {
        const { data, error } = await supabase
            .from('custody')
            .select(`
        *,
        assignee:assigned_to(name),
        requester:created_by(name)
      `)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });
        if (error) {
            console.error('Error fetching pending requests:', error);
            return;
        }
        setRequests(data || []);
    };
    const handleApproval = async (id, newStatus) => {
        const { data: custodyItem } = await supabase
            .from('custody')
            .select('*')
            .eq('id', id)
            .single();
        if (!custodyItem)
            return;
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
        fetchPendingRequests();
    };
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsx("div", { className: "sm:flex sm:items-center justify-between py-6", children: _jsxs("div", { className: "sm:flex-auto", children: [_jsx("h1", { className: "text-2xl lg:text-3xl font-bold text-gray-900", children: "\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0639\u0647\u062F" }), _jsx("p", { className: "mt-2 text-sm text-gray-700", children: "\u0642\u0627\u0626\u0645\u0629 \u0628\u062C\u0645\u064A\u0639 \u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0639\u0647\u062F \u0627\u0644\u062A\u064A \u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0645\u0648\u0627\u0641\u0642\u0629" })] }) }), _jsx("div", { className: "mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-300", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900", children: "\u0627\u0644\u0635\u0646\u0641" }), _jsx("th", { className: "px-3 py-3.5 text-right text-sm font-semibold text-gray-900", children: "\u0627\u0644\u0643\u0645\u064A\u0629" }), _jsx("th", { className: "px-3 py-3.5 text-right text-sm font-semibold text-gray-900", children: "\u0627\u0644\u0645\u0633\u062A\u0644\u0645" }), _jsx("th", { className: "px-3 py-3.5 text-right text-sm font-semibold text-gray-900", children: "\u0645\u0642\u062F\u0645 \u0627\u0644\u0637\u0644\u0628" }), _jsx("th", { className: "px-3 py-3.5 text-right text-sm font-semibold text-gray-900", children: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0637\u0644\u0628" }), _jsx("th", { className: "px-3 py-3.5 text-right text-sm font-semibold text-gray-900", children: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A" }), _jsx("th", { className: "relative py-3.5 pl-3 pr-4", children: _jsx("span", { className: "sr-only", children: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A" }) })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 bg-white", children: requests.map((request) => (_jsxs("tr", { children: [_jsx("td", { className: "py-4 pl-4 pr-3 text-sm", children: _jsx("div", { className: "font-medium text-gray-900", children: request.item_name }) }), _jsx("td", { className: "px-3 py-4 text-sm text-gray-500", children: request.quantity }), _jsx("td", { className: "px-3 py-4 text-sm", children: _jsxs("div", { className: "flex items-center", children: [_jsx("span", { className: "inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100", children: _jsx("span", { className: "text-sm font-medium text-primary-700", children: request.assignee?.name.charAt(0) }) }), _jsx("div", { className: "mr-3", children: _jsx("div", { className: "font-medium text-gray-900", children: request.assignee?.name }) })] }) }), _jsx("td", { className: "px-3 py-4 text-sm text-gray-500", children: request.requester?.name }), _jsx("td", { className: "px-3 py-4 text-sm text-gray-500", children: new Date(request.created_at).toLocaleDateString('ar-SA') }), _jsx("td", { className: "px-3 py-4 text-sm text-gray-500", children: request.notes || '-' }), _jsx("td", { className: "py-4 pl-3 pr-4 text-right text-sm", children: _jsxs("div", { className: "flex items-center justify-end gap-2", children: [_jsx("button", { onClick: () => handleApproval(request.id, 'active'), className: "p-1.5 rounded-full text-green-600 hover:bg-green-50", title: "\u0645\u0648\u0627\u0641\u0642\u0629", children: _jsx(CheckIcon, { className: "h-5 w-5" }) }), _jsx("button", { onClick: () => handleApproval(request.id, 'rejected'), className: "p-1.5 rounded-full text-red-600 hover:bg-red-50", title: "\u0631\u0641\u0636", children: _jsx(XMarkIcon, { className: "h-5 w-5" }) })] }) })] }, request.id))) })] }) })] }));
};
