import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography
} from '@mui/material'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { PlusIcon, PencilIcon, ArrowUturnLeftIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Product } from '../../types'
import { useAuth } from '../../contexts/AuthContext'

interface CustodyItem {
  id: string
  item_name: string
  quantity: number
  assigned_to: string
  status: 'pending' | 'active' | 'returned' | 'damaged' | 'rejected'
  notes: string
  created_at: string
  created_by: string
  approved_at?: string
  approved_by?: string
  assignee?: { name: string }
  approver?: { name: string }
}

export const CustodyManagement: React.FC = () => {
  const supabase = useSupabaseClient()
  const { session } = useAuth()
  const isAdmin = session?.user?.app_metadata?.role === 'admin'
  const [items, setItems] = useState<CustodyItem[]>([])
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: 1,
    assigned_to: '',
    notes: ''
  })

  useEffect(() => {
    fetchCustodyItems()
    fetchProducts()
  }, [])

  const fetchCustodyItems = async () => {
    // أولاً نجلب العهد
    const { data: custodyData, error: custodyError } = await supabase
      .from('custody')
      .select('*')
      .order('created_at', { ascending: false })

    if (custodyError) {
      console.error('Error fetching custody items:', custodyError)
      return
    }

    // ثم نجلب معلومات المستخدمين
    const userIds = custodyData.reduce((acc: string[], item) => {
      if (item.assigned_to) acc.push(item.assigned_to)
      if (item.approved_by) acc.push(item.approved_by)
      return acc
    }, [])

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name')
      .in('id', [...new Set(userIds)])

    if (userError) {
      console.error('Error fetching users:', userError)
      return
    }

    // ندمج البيانات
    const items = custodyData.map(item => ({
      ...item,
      assignee: userData.find(user => user.id === item.assigned_to),
      approver: userData.find(user => user.id === item.approved_by)
    }))

    setItems(items)
  }

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .gt('quantity', 0)
      .order('name')

    if (error) {
      console.error('Error fetching products:', error)
      return
    }
    setProducts(data || [])
  }

  const handleSubmit = async () => {
    const selectedProduct = products.find(p => p.id === formData.product_id)
    if (!selectedProduct || formData.quantity > selectedProduct.quantity) {
      alert('الكمية المطلوبة غير متوفرة')
      return
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
      }])

    if (custodyError) {
      console.error('Error adding custody:', custodyError)
      return
    }

    setOpen(false)
    setFormData({
      product_id: '',
      quantity: 1,
      assigned_to: '',
      notes: ''
    })
    fetchCustodyItems()
    fetchProducts()
  }

  const handleStatusChange = async (id: string, status: string) => {
    // أولاً نجلب معلومات العهدة
    const { data: custodyItem } = await supabase
      .from('custody')
      .select('*')
      .eq('id', id)
      .single()

    if (!custodyItem) return

    // نجلب معلومات المنتج باستخدام اسم المنتج
    const { data: product } = await supabase
      .from('products')
      .select('id, quantity')
      .eq('name', custodyItem.item_name)
      .single()

    if (!product) return

    // نقوم بتحديث حالة العهدة
    const { error: custodyError } = await supabase
      .from('custody')
      .update({ status })
      .eq('id', id)

    if (custodyError) {
      console.error('Error updating status:', custodyError)
      return
    }

    // إذا تم الإرجاع، نقوم بتحديث كمية المنتج
    if (status === 'returned') {
      const { error: productError } = await supabase
        .from('products')
        .update({ 
          quantity: product.quantity + custodyItem.quantity 
        })
        .eq('id', product.id)

      if (productError) {
        console.error('Error updating product quantity:', productError)
        return
      }
    }

    fetchCustodyItems()
    fetchProducts()
  }

  const handleApproval = async (id: string, newStatus: 'active' | 'rejected') => {
    const { data: custodyItem } = await supabase
      .from('custody')
      .select('*')
      .eq('id', id)
      .single()

    if (!custodyItem) return

    // تحديث حالة العهدة
    const { error: custodyError } = await supabase
      .from('custody')
      .update({ 
        status: newStatus,
        approved_by: session?.user?.id,
        approved_at: new Date().toISOString()
      })
      .eq('id', id)

    if (custodyError) {
      console.error('Error updating custody status:', custodyError)
      return
    }

    // إذا تمت الموافقة، نقوم بتحديث كمية المنتج
    if (newStatus === 'active') {
      const { data: product } = await supabase
        .from('products')
        .select('id, quantity')
        .eq('name', custodyItem.item_name)
        .single()

      if (!product) return

      const { error: productError } = await supabase
        .from('products')
        .update({ 
          quantity: product.quantity - custodyItem.quantity 
        })
        .eq('id', product.id)

      if (productError) {
        console.error('Error updating product quantity:', productError)
        return
      }
    }

    fetchCustodyItems()
    fetchProducts()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center justify-between py-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">إدارة العهد</h1>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              setFormData({
                product_id: '',
                quantity: 1,
                assigned_to: '',
                notes: ''
              })
              setOpen(true)
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-5 py-2.5 text-base font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
          >
            <PlusIcon className="h-5 w-5 ml-2" />
            إضافة عهدة
          </button>
        </div>
      </div>

      <div className="hidden md:block mt-4">
        <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-4 pr-4 pl-3 text-right text-base font-semibold text-gray-900">الصنف</th>
                <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900">المستلم</th>
                <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900">تاريخ التسليم</th>
                <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900">الحالة</th>
                <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900">الموافقة</th>
                <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900">الملاحظات</th>
                <th scope="col" className="relative py-4 pl-3 pr-4 w-24">
                  <span className="sr-only">إجراءات</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-4 pr-4 pl-3">
                    <div className="text-base font-medium text-gray-900">{item.item_name}</div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                        <span className="text-sm font-medium text-primary-700">
                          {item.assignee?.name.charAt(0)}
                        </span>
                      </span>
                      <div className="mr-3">
                        <div className="text-sm font-medium text-gray-900">{item.assignee?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-3 py-4">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                      item.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'returned' ? 'bg-gray-100 text-gray-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status === 'active' ? 'نشط' :
                       item.status === 'returned' ? 'مرجع' : 'معطل'}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {item.status === 'pending' ? (
                      <span className="text-yellow-600">في انتظار الموافقة</span>
                    ) : item.status === 'rejected' ? (
                      <span className="text-red-600">تم الرفض</span>
                    ) : item.status === 'active' ? (
                      <div>
                        <span className="text-green-600">تمت الموافقة</span>
                        {item.approved_by && item.approved_at && (
                          <div className="text-xs text-gray-500 mt-1">
                            بواسطة: {item.approver?.name}
                            <br />
                            {new Date(item.approved_at).toLocaleDateString('ar-SA')}
                          </div>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {item.notes || '-'}
                  </td>
                  <td className="py-4 pl-3 pr-4 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      {isAdmin && item.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproval(item.id, 'active')}
                            className="p-1.5 rounded-full text-green-600 hover:bg-green-50"
                            title="موافقة"
                          >
                            <CheckIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleApproval(item.id, 'rejected')}
                            className="p-1.5 rounded-full text-red-600 hover:bg-red-50"
                            title="رفض"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                      {item.status === 'active' && (
                        <button
                          onClick={() => handleStatusChange(item.id, 'returned')}
                          className="p-1.5 rounded-full text-green-600 hover:bg-green-50"
                          title="إرجاع"
                        >
                          <ArrowUturnLeftIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden space-y-4 mt-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white shadow-sm border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-lg font-semibold text-gray-900">{item.item_name}</div>
              </div>
              <div className="flex gap-2">
                {item.status === 'active' && (
                  <button
                    onClick={() => handleStatusChange(item.id, 'returned')}
                    className="p-1.5 rounded-full text-green-600 hover:bg-green-50"
                  >
                    <ArrowUturnLeftIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                  <span className="text-sm font-medium text-primary-700">
                    {item.assignee?.name.charAt(0)}
                  </span>
                </span>
                <div className="mr-3">
                  <div className="text-sm font-medium text-gray-900">{item.assignee?.name}</div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">تاريخ التسليم</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(item.created_at).toLocaleDateString('ar-SA')}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">الحالة</span>
                <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                  item.status === 'active' ? 'bg-blue-100 text-blue-800' :
                  item.status === 'returned' ? 'bg-gray-100 text-gray-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status === 'active' ? 'نشط' :
                   item.status === 'returned' ? 'مرجع' : 'معطل'}
                </span>
              </div>

              {item.notes && (
                <div className="border-t pt-3 mt-3">
                  <div className="text-sm text-gray-500">{item.notes}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        aria-labelledby="custody-dialog-title"
        disableEnforceFocus
        keepMounted={false}
      >
        <DialogTitle id="custody-dialog-title">إضافة عهدة جديدة</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>المنتج</InputLabel>
            <Select
              value={formData.product_id}
              onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
            >
              {products.map((product) => (
                <MenuItem key={product.id} value={product.id}>
                  <div className="flex justify-between items-center w-full">
                    <span>{product.name}</span>
                    <span className="text-sm text-gray-500">
                      (متوفر: {product.quantity})
                    </span>
                  </div>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="الكمية"
            type="number"
            fullWidth
            value={formData.quantity}
            onChange={(e) => {
              const value = parseInt(e.target.value)
              const selectedProduct = products.find(p => p.id === formData.product_id)
              if (selectedProduct && value > selectedProduct.quantity) {
                alert('الكمية المطلوبة أكبر من المتوفر')
                return
              }
              setFormData({ ...formData, quantity: value })
            }}
            inputProps={{ min: 1 }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>المستلم</InputLabel>
            <Select
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
            >
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="ملاحظات"
            fullWidth
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>إلغاء</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={!formData.product_id || !formData.assigned_to}
          >
            حفظ
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
} 