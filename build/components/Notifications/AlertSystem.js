import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Box, Alert, Snackbar, List, ListItem, ListItemText, Typography, Badge } from '@mui/material';
import { supabase } from '../../config/supabaseClient';
export const AlertSystem = () => {
    const [lowStockItems, setLowStockItems] = useState([]);
    const [open, setOpen] = useState(false);
    useEffect(() => {
        checkLowStock();
        // إعداد مراقب في الوقت الحقيقي للتغييرات
        const subscription = supabase
            .channel('product_changes')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' }, handleProductChange)
            .subscribe();
        return () => {
            subscription.unsubscribe();
        };
    }, []);
    const checkLowStock = async () => {
        const { data, error } = await supabase
            .from('products')
            .select('*')
            .filter('quantity', 'lte', 'minimum_quantity');
        if (!error && data) {
            setLowStockItems(data);
            if (data.length > 0)
                setOpen(true);
        }
    };
    const handleProductChange = () => {
        checkLowStock();
    };
    return (_jsxs(_Fragment, { children: [_jsx(Snackbar, { open: open, autoHideDuration: 6000, onClose: () => setOpen(false), children: _jsxs(Alert, { severity: "warning", sx: { width: '100%' }, children: ["\u064A\u0648\u062C\u062F ", lowStockItems.length, " \u0645\u0646\u062A\u062C\u0627\u062A \u062A\u062D\u062A \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649 \u0644\u0644\u0645\u062E\u0632\u0648\u0646"] }) }), _jsxs(Box, { component: "div", sx: { marginTop: 2 }, children: [_jsxs(Typography, { variant: "h6", children: ["\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u0632\u0648\u0646", _jsx(Badge, { badgeContent: lowStockItems?.length || 0, color: "error", sx: { ml: 2 } })] }), _jsx(List, { children: lowStockItems.map((item) => (_jsx(ListItem, { children: _jsx(ListItemText, { primary: item.name, secondary: `الكمية الحالية: ${item.quantity} | الحد الأدنى: ${item.minimum_quantity}` }) }, item.id))) })] })] }));
};
