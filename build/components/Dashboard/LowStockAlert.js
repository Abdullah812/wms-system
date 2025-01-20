import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Typography, List, ListItem, ListItemText } from '@mui/material';
export const LowStockAlert = ({ lowStockProducts }) => {
    return (_jsxs("div", { children: [_jsx(Typography, { variant: "h6", gutterBottom: true, children: "\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0627\u0644\u0645\u062E\u0632\u0648\u0646" }), _jsx(List, { children: lowStockProducts.length === 0 ? (_jsx(ListItem, { children: _jsx(ListItemText, { primary: "\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0646\u062A\u062C\u0627\u062A \u0645\u0646\u062E\u0641\u0636\u0629 \u0627\u0644\u0645\u062E\u0632\u0648\u0646" }) })) : (lowStockProducts.map((product) => (_jsx(ListItem, { children: _jsx(ListItemText, { primary: product.name, secondary: `الكمية: ${product.quantity}` }) }, product.id)))) })] }));
};
