import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
export const BarcodeScanner = ({ onScan, onError }) => {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner('reader', {
            qrbox: {
                width: 250,
                height: 100,
            },
            fps: 5,
        }, false); // Add the missing verbose parameter
        scanner.render((decodedText) => {
            onScan(decodedText);
            scanner.clear();
        }, (error) => {
            onError(typeof error === 'string' ? error : error.message || 'خطأ في قراءة الباركود');
        });
        return () => {
            scanner.clear();
        };
    }, [onScan, onError]);
    return (_jsx("div", { children: _jsx("div", { id: "reader" }) }));
};
