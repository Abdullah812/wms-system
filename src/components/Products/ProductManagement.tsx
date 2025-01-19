import React, { useState, useEffect } from 'react'
import Barcode from 'react-barcode'
import { supabase } from '../../config/supabaseClient'
import { Product } from '../../types'
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  PrinterIcon,
  ArchiveBoxIcon,
  ArrowUturnUpIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField
} from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'
import ReactDOMServer from 'react-dom/server'
import { BarcodeScanner } from './BarcodeScanner'

export const ProductManagement = () => {
  const [success, setSuccess] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
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
    barcode: ''
  })
  const [error, setError] = useState('')
  const [showBarcode, setShowBarcode] = useState<string | null>(null)
  const { session } = useAuth()
  const [viewMode, setViewMode] = useState<'active' | 'archived'>('active')
  const [showScanner, setShowScanner] = useState(false)
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null)
  const [showProductDetails, setShowProductDetails] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [viewMode])

  const fetchProducts = async () => {
    try {
      console.log('Fetching products for mode:', viewMode)
      
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          creator:created_by(name),
          updater:updated_by(name)
        `)
        .eq('status', viewMode)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      console.log('Fetched products:', data)
      setProducts(data || [])
      
    } catch (error) {
      console.error('Error fetching products:', error)
      setError('حدث خطأ في جلب المنتجات')
    }
  }

  const generateBarcode = () => {
    return Math.floor(100000000000 + Math.random() * 900000000000).toString()
  }

  const generateSKU = async () => {
    try {
      // جلب آخر منتج لمعرفة آخر رقم تسلسلي
      const { data: lastProduct } = await supabase
        .from('products')
        .select('sku')
        .order('created_at', { ascending: false })
        .limit(1)

      let sequentialNumber = 1
      
      if (lastProduct && lastProduct[0]?.sku) {
        // استخراج الرقم من آخر SKU وزيادته
        const lastNumber = parseInt(lastProduct[0].sku.split('-').pop() || '0')
        sequentialNumber = lastNumber + 1
      }

      // تنسيق الرقم التسلسلي ليكون دائماً من 3 خانات
      const formattedNumber = sequentialNumber.toString().padStart(3, '0')
      
      return `INV-${formattedNumber}`
    } catch (error) {
      console.error('Error generating SKU:', error)
      return 'INV-001' // رقم افتراضي في حالة الخطأ
    }
  }

  const handleOpenDialog = async (product?: Product) => {
    if (product) {
      setEditingProduct(product)
      setFormData({ ...formData, barcode: product.barcode })
    } else {
      setEditingProduct(null)
      const newSKU = await generateSKU()
      setFormData({ 
        ...formData, 
        barcode: generateBarcode(),
        sku: newSKU
      })
    }
    setOpenDialog(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      const newProduct = {
        ...formData,
        status: 'active',
        created_by: session?.user.id,
        created_at: new Date().toISOString(),
        updated_by: session?.user.id,
        updated_at: new Date().toISOString()
      }

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
          .eq('id', editingProduct.id)

        if (error) throw error
        setSuccess('تم تحديث المنتج بنجاح')
      } else {
        const { error } = await supabase
          .from('products')
          .insert([newProduct])

        if (error) throw error
        setSuccess('تم إضافة المنتج بنجاح')
      }

      setOpenDialog(false)
      await fetchProducts()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const handleArchive = async (id: string) => {
    if (window.confirm('هل تريد أرشفة هذا المنتج؟')) {
      try {
        const { error } = await supabase
          .from('products')
          .update({
            status: 'archived',
            updated_at: new Date().toISOString(),
            updated_by: session?.user.id
          })
          .eq('id', id)

        if (error) throw error

        setSuccess('تم أرشفة المنتج بنجاح')
        setViewMode('active') // التأكد من العودة إلى المنتجات النشطة
        await fetchProducts()
        
      } catch (error: any) {
        setError('حدث خطأ أثناء أرشفة المنتج')
        console.error('Error archiving product:', error)
      }
    }
  }

  const handleRestore = async (id: string) => {
    if (window.confirm('هل تريد استرجاع هذا المنتج؟')) {
      try {
        const { error } = await supabase
          .from('products')
          .update({ status: 'active' })
          .eq('id', id)

        if (error) throw error

        setSuccess('تم استرجاع المنتج بنجاح')
        fetchProducts()
      } catch (error: any) {
        setError('حدث خطأ أثناء استرجاع المنتج')
        console.error('Error restoring product:', error)
      }
    }
  }

  const handlePrint = (barcode: string, productName: string, sku: string) => {
    const printWindow = window.open('', '_blank')
    
    if (!printWindow) {
      console.error('Could not open print window')
      return
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
      `)
      
      printWindow.document.close()
    } catch (error) {
      console.error('Error printing barcode:', error)
    }
  }

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
        .or('status.neq.active,status.neq.archived') // أو حالتها غير صحيحة

      if (resetError) throw resetError

      // 2. إعادة تحميل المنتجات
      await fetchProducts()

    } catch (error) {
      console.error('Error fixing product statuses:', error)
      setError('حدث خطأ في إصلاح حالات المنتجات')
    }
  }

  // إضافة useEffect لتشغيل الإصلاح عند تحميل الصفحة
  useEffect(() => {
    fixProductStatuses()
  }, []) // تشغيل مرة واحدة عند تحميل المكون

  const handleBarcodeScan = async (barcode: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          creator:created_by(name),
          updater:updated_by(name)
        `)
        .eq('barcode', barcode)
        .single()

      if (error) throw error

      if (data) {
        setScannedProduct(data)
        setShowProductDetails(true)
      } else {
        setError('لم يتم العثور على المنتج')
      }
    } catch (error: any) {
      console.error('Error finding product:', error)
      setError('حدث خطأ في البحث عن المنتج')
    }
    setShowScanner(false)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center justify-between py-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">إدارة المنتجات</h1>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setEditingProduct(null)
              setOpenDialog(true)
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-5 py-2.5 text-base font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 ml-2" />
            إضافة منتج
          </button>

          <button
            onClick={() => setShowScanner(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <QrCodeIcon className="h-5 w-5 ml-2" />
            مسح باركود
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="mr-3">
              <div className="text-base font-medium text-red-800">{error}</div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 mb-6">
          <div className="flex">
            <div className="mr-3">
              <div className="text-base font-medium text-green-800">{success}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 -mx-4 sm:mx-0">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full align-middle">
            {/* للشاشات الكبيرة */}
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-4 pr-4 pl-3 text-right text-base font-semibold text-gray-900 w-1/4">
                      المنتج
                    </th>
                    <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900 w-1/5">
                      الباركود
                    </th>
                    <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900 w-1/12">
                      الكمية
                    </th>
                    <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900 w-1/5">
                      الموقع
                    </th>
                    <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900 w-1/6">
                      آخر تحديث
                    </th>
                    <th scope="col" className="relative py-4 pl-3 pr-4 w-24">
                      <span className="sr-only">إجراءات</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="py-4 pr-4 pl-3">
                        <div className="text-base font-semibold text-gray-900 mb-1">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">
                          {product.sku}
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                            {product.barcode}
                          </span>
                          <button
                            onClick={() => handlePrint(product.barcode, product.name, product.sku)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="طباعة الباركود"
                          >
                            <PrinterIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`inline-flex items-center justify-center min-w-[3rem] px-2.5 py-1 rounded-full text-sm font-medium ${
                          product.quantity <= product.minimum_quantity 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <div className="text-sm text-gray-900">
                          <span className="inline-flex items-center gap-1">
                            <span className="font-medium">منطقة:</span>
                            {product.location.zone}
                          </span>
                          <span className="mx-1">-</span>
                          <span className="inline-flex items-center gap-1">
                            <span className="font-medium">رف:</span>
                            {product.location.rack}
                          </span>
                          <span className="mx-1">-</span>
                          <span className="inline-flex items-center gap-1">
                            <span className="font-medium">طبقة:</span>
                            {product.location.shelf}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-4">
                        <div className="text-sm text-gray-900">
                          {new Date(product.updated_at).toLocaleString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {product.updater?.name || 'غير معروف'}
                        </div>
                      </td>
                      <td className="relative py-4 pl-3 pr-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenDialog(product)}
                            className="text-primary-600 hover:text-primary-900 transition-colors"
                            title="تعديل"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleArchive(product.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="أرشفة"
                          >
                            <ArchiveBoxIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* للجوال */}
            <div className="md:hidden space-y-4">
              {products.map((product) => (
                <div key={product.id} className="bg-white shadow-sm border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm font-medium text-gray-500">
                        {product.sku}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenDialog(product)}
                        className="p-1.5 rounded-full text-primary-600 hover:bg-primary-50"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleArchive(product.id)}
                        className="p-1.5 rounded-full text-red-600 hover:bg-red-50"
                      >
                        <ArchiveBoxIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">الباركود</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {product.barcode}
                        </span>
                        <button
                          onClick={() => handlePrint(product.barcode, product.name, product.sku)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <PrinterIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">الكمية</span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                        product.quantity <= product.minimum_quantity 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.quantity}
                      </span>
                    </div>

                    <div className="border-t pt-3">
                      <div className="text-sm text-gray-500 mb-1">الموقع</div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center p-1.5 bg-gray-50 rounded">
                          <span className="block text-gray-500 text-xs mb-1">منطقة</span>
                          <span className="font-medium">{product.location.zone}</span>
                        </div>
                        <div className="text-center p-1.5 bg-gray-50 rounded">
                          <span className="block text-gray-500 text-xs mb-1">رف</span>
                          <span className="font-medium">{product.location.rack}</span>
                        </div>
                        <div className="text-center p-1.5 bg-gray-50 rounded">
                          <span className="block text-gray-500 text-xs mb-1">طبقة</span>
                          <span className="font-medium">{product.location.shelf}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">آخر تحديث</span>
                        <span className="text-gray-900">
                          {new Date(product.updated_at).toLocaleString('ar-SA', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 text-left">
                        {product.updater?.name || 'غير معروف'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="text-xl font-semibold border-b pb-4">
          {editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'}
        </DialogTitle>
        <DialogContent className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                اسم المنتج
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
                SKU
              </label>
              <input
                type="text"
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                الكمية
              </label>
              <input
                type="number"
                id="quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="minimum_quantity" className="block text-sm font-medium text-gray-700">
                الحد الأدنى للكمية
              </label>
              <input
                type="number"
                id="minimum_quantity"
                value={formData.minimum_quantity}
                onChange={(e) => setFormData({ ...formData, minimum_quantity: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                الفئة
              </label>
              <input
                type="text"
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="zone" className="block text-sm font-medium text-gray-700">
                  المنطقة
                </label>
                <input
                  type="text"
                  id="zone"
                  value={formData.location.zone}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, zone: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="rack" className="block text-sm font-medium text-gray-700">
                  الرف
                </label>
                <input
                  type="text"
                  id="rack"
                  value={formData.location.rack}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, rack: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label htmlFor="shelf" className="block text-sm font-medium text-gray-700">
                  الطبقة
                </label>
                <input
                  type="text"
                  id="shelf"
                  value={formData.location.shelf}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, shelf: e.target.value }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                الباركود
              </label>
              <div className="mt-1 text-center">
                <Barcode value={formData.barcode} />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
              <button
                type="button"
                onClick={() => setOpenDialog(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                {editingProduct ? 'تحديث' : 'إضافة'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showScanner} onClose={() => setShowScanner(false)}>
        <DialogTitle>مسح الباركود</DialogTitle>
        <DialogContent>
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onError={(error) => {
              setError(error)
              setShowScanner(false)
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog 
        open={showProductDetails} 
        onClose={() => setShowProductDetails(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="text-xl font-semibold border-b pb-4">
          تفاصيل المنتج
        </DialogTitle>
        <DialogContent className="mt-4">
          {scannedProduct && (
            <div className="space-y-4">
              <div>
                <label className="font-medium">اسم المنتج:</label>
                <p className="mt-1">{scannedProduct.name}</p>
              </div>
              <div>
                <label className="font-medium">SKU:</label>
                <p className="mt-1">{scannedProduct.sku}</p>
              </div>
              <div>
                <label className="font-medium">الباركود:</label>
                <p className="mt-1">{scannedProduct.barcode}</p>
              </div>
              <div>
                <label className="font-medium">الكمية:</label>
                <p className="mt-1">{scannedProduct.quantity}</p>
              </div>
              <div>
                <label className="font-medium">الحد الأدنى:</label>
                <p className="mt-1">{scannedProduct.minimum_quantity}</p>
              </div>
              <div>
                <label className="font-medium">الموقع:</label>
                <p className="mt-1">
                  {`${scannedProduct.location.zone} - ${scannedProduct.location.rack} - ${scannedProduct.location.shelf}`}
                </p>
              </div>
              <div>
                <label className="font-medium">أضيف بواسطة:</label>
                <p className="mt-1">{scannedProduct.creator?.name}</p>
              </div>
              <div>
                <label className="font-medium">آخر تحديث:</label>
                <p className="mt-1">{scannedProduct.updater?.name}</p>
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowProductDetails(false)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              إغلاق
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 