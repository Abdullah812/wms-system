import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabaseClient'
import {
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline'
import {
  Dialog,
  DialogTitle,
  DialogContent
} from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'
import { BarcodeScanner } from '../Products/BarcodeScanner'

interface Transaction {
  id: string
  product_id: string
  type: 'in' | 'out'
  quantity: number
  from_location: string
  to_location: string
  notes: string
  created_at: string
  created_by: string
  product: {
    name: string
    sku: string
    barcode: string
    unit: string
  }
  creator: {
    name: string
  }
  receiver?: string
  sender?: string
  amount?: number
}

interface User {
  id: string
  name: string
}

export const TransactionForm = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const { session } = useAuth()
  const [formData, setFormData] = useState({
    product_id: '',
    type: 'in' as 'in' | 'out',
    quantity: 1,
    amount: 0,
    receiver: '',
    sender: '',
    notes: ''
  })
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    fetchTransactions()
    fetchUsers()
  }, [])

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          product:product_id(name, sku, barcode),
          creator:created_by(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setError('حدث خطأ في جلب المعاملات')
    }
  }

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name')
        .eq('active', true)
        .order('name')
      
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleBarcodeScan = async (barcode: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('barcode', barcode)
        .single()

      if (error) throw error

      if (data) {
        setSelectedProduct(data)
        setFormData(prev => ({ ...prev, product_id: data.id }))
        setOpenDialog(true)
      } else {
        setError('لم يتم العثور على المنتج')
      }
    } catch (error) {
      console.error('Error finding product:', error)
      setError('حدث خطأ في البحث عن المنتج')
    }
    setShowScanner(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      // 1. إنشاء المعاملة
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          ...formData,
          created_by: session?.user.id,
          created_at: new Date().toISOString()
        }])

      if (transactionError) throw transactionError

      // 2. تحديث كمية المنتج
      const quantityChange = formData.type === 'in' ? formData.quantity : -formData.quantity
      const { error: productError } = await supabase
        .from('products')
        .update({ 
          quantity: selectedProduct.quantity + quantityChange,
          updated_by: session?.user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', formData.product_id)

      if (productError) throw productError

      setSuccess('تم تسجيل المعاملة بنجاح')
      setOpenDialog(false)
      setFormData({
        product_id: '',
        type: 'in',
        quantity: 1,
        amount: 0,
        receiver: '',
        sender: '',
        notes: ''
      })
      setSelectedProduct(null)
      fetchTransactions()
    } catch (error: any) {
      setError(error.message)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center justify-between py-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">سجل الحركة</h1>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setSelectedProduct(null)
              setFormData({
                product_id: '',
                type: 'in',
                quantity: 1,
                amount: 0,
                receiver: '',
                sender: '',
                notes: ''
              })
              setOpenDialog(true)
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-5 py-2.5 text-base font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 ml-2" />
            إضافة حركة
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
            <div className="hidden md:block">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-4 pr-4 pl-3 text-right text-base font-semibold text-gray-900">
                      الباركود
                    </th>
                    <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900">
                      الصنف
                    </th>
                    <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900">
                      الوحدة
                    </th>
                    <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900">
                      الكمية
                    </th>
                    <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900">
                      المبلغ
                    </th>
                    <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900">
                      المستلم
                    </th>
                    <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900">
                      المسلم
                    </th>
                    <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900">
                      الحالة
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="whitespace-nowrap py-4 pr-4 pl-3 text-base text-gray-900">
                        {transaction.product.barcode}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-base text-gray-900">
                        {transaction.product.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-base text-gray-500">
                        {transaction.product.unit}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-base text-gray-500">
                        {transaction.quantity}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-base text-gray-500">
                        {transaction.amount || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-base text-gray-500">
                        {transaction.receiver || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-base text-gray-500">
                        {transaction.sender || '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'in' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'in' ? 'وارد' : 'صادر'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="bg-white shadow rounded-lg mb-4 p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">{transaction.product.name}</h3>
                      <p className="text-sm text-gray-500">{transaction.product.sku}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === 'in' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === 'in' ? 'وارد' : 'صادر'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">الكمية:</span>
                      <span className="font-medium mr-1">{transaction.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">التاريخ:</span>
                      <span className="font-medium mr-1">
                        {new Date(transaction.created_at).toLocaleString('ar-SA')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">من موقع:</span>
                      <span className="font-medium mr-1">{transaction.from_location || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">إلى موقع:</span>
                      <span className="font-medium mr-1">{transaction.to_location || '-'}</span>
                    </div>
                    {transaction.notes && (
                      <div className="col-span-2">
                        <span className="text-gray-500">ملاحظات:</span>
                        <span className="font-medium mr-1">{transaction.notes}</span>
                      </div>
                    )}
                    <div className="col-span-2">
                      <span className="text-gray-500">بواسطة:</span>
                      <span className="font-medium mr-1">{transaction.creator?.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={window.innerWidth < 640}
        keepMounted={false}
        disablePortal={false}
        aria-labelledby="transaction-dialog-title"
      >
        <DialogTitle id="transaction-dialog-title" className="text-xl font-semibold border-b pb-4">
          تسجيل حركة جديدة
        </DialogTitle>
        <DialogContent className="mt-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!selectedProduct && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  بحث عن صنف
                </label>
                <input
                  type="text"
                  placeholder="ادخل اسم الصنف أو الباركود"
                  onChange={async (e) => {
                    try {
                      const { data, error } = await supabase
                        .from('products')
                        .select('*')
                        .or(`name.ilike.%${e.target.value}%,barcode.eq.${e.target.value},sku.ilike.%${e.target.value}%`)
                        .single()
                      if (data) {
                        setSelectedProduct(data)
                        setFormData(prev => ({ ...prev, product_id: data.id }))
                      }
                    } catch (error) {
                      console.error('Error searching product:', error)
                    }
                  }}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
            )}
            {selectedProduct && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">الصنف</label>
                  <p className="mt-1">
                    {selectedProduct.name}
                    <span className="text-sm text-gray-500 block">{selectedProduct.sku}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">الكمية</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">المبلغ</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount || ''}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">المستلم</label>
                  <select
                    value={formData.receiver || ''}
                    onChange={(e) => setFormData({ ...formData, receiver: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="">اختر المستلم</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">المسلم</label>
                  <select
                    value={formData.sender || ''}
                    onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="">اختر المسلم</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">الحالة</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'in' | 'out' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="in">وارد</option>
                    <option value="out">صادر</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">ملاحظات</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3 space-x-reverse">
                  <button
                    type="button"
                    onClick={() => setOpenDialog(false)}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700"
                  >
                    حفظ
                  </button>
                </div>
              </>
            )}
          </form>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={showScanner} 
        onClose={() => setShowScanner(false)}
        keepMounted={false}
        disablePortal={false}
        aria-labelledby="scanner-dialog-title"
      >
        <DialogTitle id="scanner-dialog-title">مسح الباركود</DialogTitle>
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
    </div>
  )
} 