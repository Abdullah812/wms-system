import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import Barcode from 'react-barcode';
import { supabase } from '../../config/supabaseClient';
import { PencilIcon, PlusIcon, PrinterIcon, ArchiveBoxIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { BarcodeScanner } from './BarcodeScanner';
export const ProductManagement = () => {
    const [success, setSuccess] = useState('');
    const [products, setProducts] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        quantity: 0,
        minimum_quantity: 0,
        category: '',
        location: {
            zone: '',
            rack: '',
            shelf: ''
        },
        barcode: '',
        unit: '',
        price: 0,
        notes: ''
    });
    const [error, setError] = useState('');
    const [showBarcode, setShowBarcode] = useState(null);
    const { session } = useAuth();
    const [viewMode, setViewMode] = useState('active');
    const [showScanner, setShowScanner] = useState(false);
    const [scannedProduct, setScannedProduct] = useState(null);
    const [showProductDetails, setShowProductDetails] = useState(false);
    useEffect(() => {
        fetchProducts();
    }, [viewMode]);
    const fetchProducts = async () => {
        try {
            console.log('Fetching products for mode:', viewMode);
            const { data, error } = await supabase
                .from('products')
                .select(`
          *,
          creator:created_by(name),
          updater:updated_by(name)
        `)
                .eq('status', viewMode)
                .order('created_at', { ascending: false });
            if (error)
                throw error;
            console.log('Fetched products:', data);
            setProducts(data || []);
        }
        catch (error) {
            console.error('Error fetching products:', error);
            setError('حدث خطأ في جلب المنتجات');
        }
    };
    const generateBarcode = () => {
        return Math.floor(100000000000 + Math.random() * 900000000000).toString();
    };
    const generateSKU = async () => {
        try {
            // جلب آخر منتج لمعرفة آخر رقم تسلسلي
            const { data: lastProduct } = await supabase
                .from('products')
                .select('sku')
                .order('created_at', { ascending: false })
                .limit(1);
            let sequentialNumber = 1;
            if (lastProduct && lastProduct[0]?.sku) {
                // استخراج الرقم من آخر SKU وزيادته
                const lastNumber = parseInt(lastProduct[0].sku.split('-').pop() || '0');
                sequentialNumber = lastNumber + 1;
            }
            // تنسيق الرقم التسلسلي ليكون دائماً من 3 خانات
            const formattedNumber = sequentialNumber.toString().padStart(3, '0');
            return `INV-${formattedNumber}`;
        }
        catch (error) {
            console.error('Error generating SKU:', error);
            return 'INV-001'; // رقم افتراضي في حالة الخطأ
        }
    };
    const handleOpenDialog = async (product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({ ...formData, barcode: product.barcode });
        }
        else {
            setEditingProduct(null);
            const newSKU = await generateSKU();
            setFormData({
                ...formData,
                barcode: generateBarcode(),
                sku: newSKU
            });
        }
        setOpenDialog(true);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const newProduct = {
                ...formData,
                status: 'active',
                created_by: session?.user.id,
                created_at: new Date().toISOString(),
                updated_by: session?.user.id,
                updated_at: new Date().toISOString()
            };
            if (editingProduct) {
                const { error } = await supabase
                    .from('products')
                    .update({
                    ...newProduct,
                    created_by: editingProduct.created_by,
                    created_at: editingProduct.created_at,
                    updated_by: session?.user.id,
                    updated_at: new Date().toISOString()
                })
                    .eq('id', editingProduct.id);
                if (error)
                    throw error;
                setSuccess('تم تحديث المنتج بنجاح');
            }
            else {
                const { error } = await supabase
                    .from('products')
                    .insert([newProduct]);
                if (error)
                    throw error;
                setSuccess('تم إضافة المنتج بنجاح');
            }
            setOpenDialog(false);
            await fetchProducts();
        }
        catch (error) {
            setError(error.message);
        }
    };
    const handleArchive = async (id) => {
        if (window.confirm('هل تريد أرشفة هذا المنتج؟')) {
            try {
                const { error } = await supabase
                    .from('products')
                    .update({
                    status: 'archived',
                    updated_at: new Date().toISOString(),
                    updated_by: session?.user.id
                })
                    .eq('id', id);
                if (error)
                    throw error;
                setSuccess('تم أرشفة المنتج بنجاح');
                setViewMode('active'); // التأكد من العودة إلى المنتجات النشطة
                await fetchProducts();
            }
            catch (error) {
                setError('حدث خطأ أثناء أرشفة المنتج');
                console.error('Error archiving product:', error);
            }
        }
    };
    const handleRestore = async (id) => {
        if (window.confirm('هل تريد استرجاع هذا المنتج؟')) {
            try {
                const { error } = await supabase
                    .from('products')
                    .update({ status: 'active' })
                    .eq('id', id);
                if (error)
                    throw error;
                setSuccess('تم استرجاع المنتج بنجاح');
                fetchProducts();
            }
            catch (error) {
                setError('حدث خطأ أثناء استرجاع المنتج');
                console.error('Error restoring product:', error);
            }
        }
    };
    const handlePrint = (barcode, productName, sku) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            console.error('Could not open print window');
            return;
        }
        try {
            printWindow.document.write(`
        <html dir="rtl">
          <head>
            <title>طباعة الباركود</title>
            <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.0/dist/JsBarcode.all.min.js"></script>
            <style>
              @page {
                size: 50mm 25mm;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                width: 50mm;
                height: 25mm;
              }
              .sticker {
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 2mm;
                box-sizing: border-box;
              }
              .product-name {
                font-size: 8pt;
                font-weight: bold;
                margin-bottom: 1mm;
                text-align: center;
                width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              }
              .sku {
                font-size: 7pt;
                margin-bottom: 1mm;
              }
              .barcode-container {
                height: 15mm;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .barcode-container svg {
                max-width: 100%;
                height: 100%;
              }
            </style>
          </head>
          <body>
            <div class="sticker">
              <div class="product-name">${productName}</div>
              <div class="sku">${sku}</div>
              <div class="barcode-container">
                <svg class="barcode"></svg>
              </div>
            </div>
            <script>
              setTimeout(() => {
                JsBarcode(".barcode", "${barcode}", {
                  width: 1.5,
                  height: 30,
                  fontSize: 8,
                  displayValue: true,
                  format: "CODE128",
                  margin: 0
                });
                
                setTimeout(() => {
                  window.print();
                  window.onafterprint = () => window.close();
                }, 500);
              }, 100);
            </script>
          </body>
        </html>
      `);
            printWindow.document.close();
        }
        catch (error) {
            console.error('Error printing barcode:', error);
        }
    };
    // دالة لإصلاح حالات المنتجات
    const fixProductStatuses = async () => {
        try {
            // 1. تحديث جميع المنتجات لتكون نشطة
            const { error: resetError } = await supabase
                .from('products')
                .update({
                status: 'active',
                updated_at: new Date().toISOString()
            })
                .is('status', null) // تحديث المنتجات التي ليس لها حالة
                .or('status.neq.active,status.neq.archived'); // أو حالتها غير صحيحة
            if (resetError)
                throw resetError;
            // 2. إعادة تحميل المنتجات
            await fetchProducts();
        }
        catch (error) {
            console.error('Error fixing product statuses:', error);
            setError('حدث خطأ في إصلاح حالات المنتجات');
        }
    };
    // إضافة useEffect لتشغيل الإصلاح عند تحميل الصفحة
    useEffect(() => {
        fixProductStatuses();
    }, []); // تشغيل مرة واحدة عند تحميل المكون
    const handleBarcodeScan = async (barcode) => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
          *,
          creator:created_by(name),
          updater:updated_by(name)
        `)
                .eq('barcode', barcode)
                .single();
            if (error)
                throw error;
            if (data) {
                setScannedProduct(data);
                setShowProductDetails(true);
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
    return (_jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "sm:flex sm:items-center justify-between py-6", children: [_jsx("div", { className: "sm:flex-auto", children: _jsx("h1", { className: "text-2xl lg:text-3xl font-bold text-gray-900", children: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0635\u0646\u0627\u0641" }) }), _jsxs("div", { className: "mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3", children: [_jsxs("button", { onClick: () => {
                                    setEditingProduct(null);
                                    setOpenDialog(true);
                                }, className: "w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-5 py-2.5 text-base font-medium text-white shadow-sm hover:bg-primary-700 transition-colors", children: [_jsx(PlusIcon, { className: "h-5 w-5 ml-2" }), "\u0625\u0636\u0627\u0641\u0629 \u0635\u0646\u0641"] }), _jsxs("button", { onClick: () => setShowScanner(true), className: "w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors", children: [_jsx(QrCodeIcon, { className: "h-5 w-5 ml-2" }), "\u0645\u0633\u062D \u0628\u0627\u0631\u0643\u0648\u062F"] })] })] }), error && (_jsx("div", { className: "rounded-md bg-red-50 p-4 mb-6", children: _jsx("div", { className: "flex", children: _jsx("div", { className: "mr-3", children: _jsx("div", { className: "text-base font-medium text-red-800", children: error }) }) }) })), success && (_jsx("div", { className: "rounded-md bg-green-50 p-4 mb-6", children: _jsx("div", { className: "flex", children: _jsx("div", { className: "mr-3", children: _jsx("div", { className: "text-base font-medium text-green-800", children: success }) }) }) })), _jsx("div", { className: "mt-4 -mx-4 sm:mx-0", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("div", { className: "inline-block min-w-full align-middle", children: [_jsx("div", { className: "hidden md:block", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-300", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { scope: "col", className: "py-4 pr-4 pl-3 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u0635\u0646\u0641" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u0648\u062D\u062F\u0629" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u0643\u0645\u064A\u0629" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u0645\u0628\u0644\u063A" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900", children: "\u0622\u062E\u0631 \u062A\u062D\u062F\u064A\u062B" }), _jsx("th", { scope: "col", className: "px-3 py-4 text-right text-base font-semibold text-gray-900", children: "\u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A" }), _jsx("th", { scope: "col", className: "relative py-4 pl-3 pr-4 w-24", children: _jsx("span", { className: "sr-only", children: "\u0625\u062C\u0631\u0627\u0621\u0627\u062A" }) })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 bg-white", children: products.map((product) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "py-4 pr-4 pl-3", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("span", { className: "font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded", children: product.barcode }), _jsx("button", { onClick: () => handlePrint(product.barcode, product.name, product.sku), className: "text-gray-400 hover:text-gray-600 transition-colors", title: "\u0637\u0628\u0627\u0639\u0629 \u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F", children: _jsx(PrinterIcon, { className: "h-5 w-5" }) })] }) }), _jsx("td", { className: "px-3 py-4", children: _jsx("div", { className: "text-base font-semibold text-gray-900", children: product.name }) }), _jsx("td", { className: "px-3 py-4", children: _jsx("div", { className: "text-sm text-gray-900", children: product.unit }) }), _jsx("td", { className: "px-3 py-4", children: _jsx("span", { className: `inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-full text-sm font-medium ${product.quantity <= product.minimum_quantity
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-green-100 text-green-800'}`, children: product.quantity }) }), _jsx("td", { className: "px-3 py-4", children: _jsx("div", { className: "text-sm text-gray-900", children: product.price }) }), _jsxs("td", { className: "px-3 py-4", children: [_jsx("div", { className: "text-sm text-gray-900", children: new Date(product.updated_at).toLocaleString('ar-SA', {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                }) }), _jsx("div", { className: "text-sm text-gray-500", children: product.updater?.name || 'غير معروف' })] }), _jsx("td", { className: "px-3 py-4", children: _jsx("div", { className: "text-sm text-gray-900", children: product.notes || '-' }) }), _jsx("td", { className: "relative py-4 pl-3 pr-4", children: _jsxs("div", { className: "flex justify-end gap-2", children: [_jsx("button", { onClick: () => handleOpenDialog(product), className: "text-primary-600 hover:text-primary-900 transition-colors", title: "\u062A\u0639\u062F\u064A\u0644", children: _jsx(PencilIcon, { className: "h-5 w-5" }) }), _jsx("button", { onClick: () => handleArchive(product.id), className: "text-red-600 hover:text-red-900 transition-colors", title: "\u0623\u0631\u0634\u0641\u0629", children: _jsx(ArchiveBoxIcon, { className: "h-5 w-5" }) })] }) })] }, product.id))) })] }) }), _jsx("div", { className: "md:hidden space-y-4", children: products.map((product) => (_jsxs("div", { className: "bg-white shadow-sm border rounded-lg p-4", children: [_jsxs("div", { className: "flex justify-between items-start mb-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-1", children: product.name }), _jsx("p", { className: "text-sm font-medium text-gray-500", children: product.sku })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => handleOpenDialog(product), className: "p-1.5 rounded-full text-primary-600 hover:bg-primary-50", children: _jsx(PencilIcon, { className: "h-5 w-5" }) }), _jsx("button", { onClick: () => handleArchive(product.id), className: "p-1.5 rounded-full text-red-600 hover:bg-red-50", children: _jsx(ArchiveBoxIcon, { className: "h-5 w-5" }) })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "\u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-mono text-sm bg-gray-100 px-2 py-1 rounded", children: product.barcode }), _jsx("button", { onClick: () => handlePrint(product.barcode, product.name, product.sku), className: "text-gray-400 hover:text-gray-600", children: _jsx(PrinterIcon, { className: "h-5 w-5" }) })] })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "text-sm text-gray-500", children: "\u0627\u0644\u0643\u0645\u064A\u0629" }), _jsx("span", { className: `inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${product.quantity <= product.minimum_quantity
                                                                ? 'bg-red-100 text-red-800'
                                                                : 'bg-green-100 text-green-800'}`, children: product.quantity })] }), _jsxs("div", { className: "border-t pt-3", children: [_jsx("div", { className: "text-sm text-gray-500 mb-1", children: "\u0627\u0644\u0645\u0648\u0642\u0639" }), _jsxs("div", { className: "grid grid-cols-3 gap-2 text-sm", children: [_jsxs("div", { className: "text-center p-1.5 bg-gray-50 rounded", children: [_jsx("span", { className: "block text-gray-500 text-xs mb-1", children: "\u0645\u0646\u0637\u0642\u0629" }), _jsx("span", { className: "font-medium", children: product.location.zone })] }), _jsxs("div", { className: "text-center p-1.5 bg-gray-50 rounded", children: [_jsx("span", { className: "block text-gray-500 text-xs mb-1", children: "\u0631\u0641" }), _jsx("span", { className: "font-medium", children: product.location.rack })] }), _jsxs("div", { className: "text-center p-1.5 bg-gray-50 rounded", children: [_jsx("span", { className: "block text-gray-500 text-xs mb-1", children: "\u0637\u0628\u0642\u0629" }), _jsx("span", { className: "font-medium", children: product.location.shelf })] })] })] }), _jsxs("div", { className: "border-t pt-3", children: [_jsxs("div", { className: "flex justify-between items-center text-sm", children: [_jsx("span", { className: "text-gray-500", children: "\u0622\u062E\u0631 \u062A\u062D\u062F\u064A\u062B" }), _jsx("span", { className: "text-gray-900", children: new Date(product.updated_at).toLocaleString('ar-SA', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric'
                                                                    }) })] }), _jsx("div", { className: "text-sm text-gray-500 text-left", children: product.updater?.name || 'غير معروف' })] })] })] }, product.id))) })] }) }) }), _jsxs(Dialog, { open: openDialog, onClose: () => setOpenDialog(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { className: "text-xl font-semibold border-b pb-4", children: editingProduct ? 'تعديل صنف' : 'إضافة صنف جديد' }), _jsx(DialogContent, { className: "mt-4", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "name", className: "block text-sm font-medium text-gray-700", children: "\u0627\u0633\u0645 \u0627\u0644\u0635\u0646\u0641" }), _jsx("input", { type: "text", id: "name", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "unit", className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u0648\u062D\u062F\u0629" }), _jsx("input", { type: "text", id: "unit", value: formData.unit, onChange: (e) => setFormData({ ...formData, unit: e.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "quantity", className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u0643\u0645\u064A\u0629" }), _jsx("input", { type: "number", id: "quantity", value: formData.quantity, onChange: (e) => setFormData({ ...formData, quantity: parseInt(e.target.value) }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "price", className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u0645\u0628\u0644\u063A" }), _jsx("input", { type: "number", id: "price", step: "0.01", value: formData.price, onChange: (e) => setFormData({ ...formData, price: parseFloat(e.target.value) }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "minimum_quantity", className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649 \u0644\u0644\u0643\u0645\u064A\u0629" }), _jsx("input", { type: "number", id: "minimum_quantity", value: formData.minimum_quantity, onChange: (e) => setFormData({ ...formData, minimum_quantity: parseInt(e.target.value) }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm", required: true })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "notes", className: "block text-sm font-medium text-gray-700", children: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A" }), _jsx("textarea", { id: "notes", rows: 3, value: formData.notes, onChange: (e) => setFormData({ ...formData, notes: e.target.value }), className: "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700", children: "\u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F" }), _jsx("div", { className: "mt-1 text-center", children: _jsx(Barcode, { value: formData.barcode }) })] }), _jsxs("div", { className: "mt-6 flex justify-end space-x-3 space-x-reverse", children: [_jsx("button", { type: "button", onClick: () => setOpenDialog(false), className: "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2", children: "\u0625\u0644\u063A\u0627\u0621" }), _jsx("button", { type: "submit", className: "inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2", children: editingProduct ? 'تحديث' : 'إضافة' })] })] }) })] }), _jsxs(Dialog, { open: showScanner, onClose: () => setShowScanner(false), children: [_jsx(DialogTitle, { children: "\u0645\u0633\u062D \u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F" }), _jsx(DialogContent, { children: _jsx(BarcodeScanner, { onScan: handleBarcodeScan, onError: (error) => {
                                setError(error);
                                setShowScanner(false);
                            } }) })] }), _jsxs(Dialog, { open: showProductDetails, onClose: () => setShowProductDetails(false), maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { className: "text-xl font-semibold border-b pb-4", children: "\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0635\u0646\u0641" }), _jsxs(DialogContent, { className: "mt-4", children: [scannedProduct && (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "font-medium", children: "\u0627\u0633\u0645 \u0627\u0644\u0635\u0646\u0641:" }), _jsx("p", { className: "mt-1", children: scannedProduct.name })] }), _jsxs("div", { children: [_jsx("label", { className: "font-medium", children: "SKU:" }), _jsx("p", { className: "mt-1", children: scannedProduct.sku })] }), _jsxs("div", { children: [_jsx("label", { className: "font-medium", children: "\u0627\u0644\u0628\u0627\u0631\u0643\u0648\u062F:" }), _jsx("p", { className: "mt-1", children: scannedProduct.barcode })] }), _jsxs("div", { children: [_jsx("label", { className: "font-medium", children: "\u0627\u0644\u0643\u0645\u064A\u0629:" }), _jsx("p", { className: "mt-1", children: scannedProduct.quantity })] }), _jsxs("div", { children: [_jsx("label", { className: "font-medium", children: "\u0627\u0644\u062D\u062F \u0627\u0644\u0623\u062F\u0646\u0649:" }), _jsx("p", { className: "mt-1", children: scannedProduct.minimum_quantity })] }), _jsxs("div", { children: [_jsx("label", { className: "font-medium", children: "\u0627\u0644\u0645\u0648\u0642\u0639:" }), _jsx("p", { className: "mt-1", children: `${scannedProduct.location.zone} - ${scannedProduct.location.rack} - ${scannedProduct.location.shelf}` })] }), _jsxs("div", { children: [_jsx("label", { className: "font-medium", children: "\u0623\u0636\u064A\u0641 \u0628\u0648\u0627\u0633\u0637\u0629:" }), _jsx("p", { className: "mt-1", children: scannedProduct.creator?.name })] }), _jsxs("div", { children: [_jsx("label", { className: "font-medium", children: "\u0622\u062E\u0631 \u062A\u062D\u062F\u064A\u062B:" }), _jsx("p", { className: "mt-1", children: scannedProduct.updater?.name })] })] })), _jsx("div", { className: "mt-6 flex justify-end", children: _jsx("button", { onClick: () => setShowProductDetails(false), className: "rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50", children: "\u0625\u063A\u0644\u0627\u0642" }) })] })] })] }));
};
