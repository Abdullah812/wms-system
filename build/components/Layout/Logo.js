import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Logo = ({ className = '', size = 'md' }) => {
    const sizes = {
        sm: 'h-6 w-auto',
        md: 'h-8 w-auto',
        lg: 'h-10 w-auto'
    };
    return (_jsxs("div", { className: `flex items-center gap-3 group transition-all duration-300 ${className}`, children: [_jsx("div", { className: "overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300", children: _jsx("img", { src: "/images/\u0627\u0644\u0634\u0639\u0627\u0631.jpg", alt: "\u0646\u0638\u0627\u0645 \u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0645\u062E\u0632\u0648\u0646", className: `${sizes[size]} object-contain hover:scale-105 transition-transform duration-300` }) }), _jsx("div", { className: `font-bold ${size === 'sm' ? 'text-lg' :
                    size === 'md' ? 'text-xl' :
                        'text-2xl'} text-primary-600 group-hover:text-primary-700 transition-colors duration-300`, children: "\u0646\u0638\u0627\u0645 \u0627\u0644\u0645\u062E\u0632\u0648\u0646" })] }));
};
