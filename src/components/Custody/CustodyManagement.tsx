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
import { PlusIcon, PencilIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline'
import { Product } from '../../types'

interface CustodyItem {
  id: string
  item_name: string
  quantity: number
  assigned_to: string
  status: 'active' | 'returned' | 'damaged'
  notes: string
  created_at: string
  assignee?: {
    name: string
  }
}

export const CustodyManagement: React.FC = () => {
  const supabase = useSupabaseClient()
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
    fetchUsers()
    fetchProducts()
  }, [])

  const fetchCustodyItems = async () => {
    const { data, error } = await supabase
      .from('custody')
      .select(`
        *,
        assignee:assigned_to(name)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching custody items:', error)
      return
    }
    setItems(data || [])
  }

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, name')
      .order('name')

    if (error) {
      console.error('Error fetching users:', error)
      return
    }
    setUsers(data || [])
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
        product_id: formData.product_id,
        quantity: formData.quantity,
        assigned_to: formData.assigned_to,
        notes: formData.notes,
        status: 'active'
      }])

    if (custodyError) {
      console.error('Error adding custody:', custodyError)
      return
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({ 
        quantity: selectedProduct.quantity - formData.quantity 
      })
      .eq('id', formData.product_id)

    if (updateError) {
      console.error('Error updating product quantity:', updateError)
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
    const { error } = await supabase
      .from('custody')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('Error updating status:', error)
      return
    }

    fetchCustodyItems()
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
                <th scope="col" className="py-4 pr-4 pl-3 text-right text-base font-semibold text-gray-900">المنتج</th>
                <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900">المستلم</th>
                <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900">تاريخ التسليم</th>
                <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900">الحالة</th>
                <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900">ملاحظات</th>
                <th scope="col" className="relative py-4 pl-3 pr-4 w-24">
                  <span className="sr-only">إجراءات</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-4 pr-4 pl-3">
                    <div className="flex items-center">
                      <div className="mr-4">
                        <div className="text-base font-medium text-gray-900">{item.item_name}</div>
                      </div>
                    </div>
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
                      item.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : item.status === 'returned'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {item.status === 'active' ? 'نشطة' : item.status === 'returned' ? 'مرجعة' : 'معلقة'}
                    </span>
                  </td>
                  <td className="px-3 py-4 text-sm text-gray-500">
                    {item.notes || '-'}
                  </td>
                  <td className="py-4 pl-3 pr-4 text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleStatusChange(item.id, 'returned')}
                        className="p-1.5 rounded-full text-green-600 hover:bg-green-50"
                      >
                        <ArrowUturnLeftIcon className="h-5 w-5" />
                      </button>
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
                <button
                  onClick={() => handleStatusChange(item.id, 'returned')}
                  className="p-1.5 rounded-full text-green-600 hover:bg-green-50"
                >
                  <ArrowUturnLeftIcon className="h-5 w-5" />
                </button>
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
                  item.status === 'active' 
                    ? 'bg-green-100 text-green-800'
                    : item.status === 'returned'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {item.status === 'active' ? 'نشطة' : item.status === 'returned' ? 'مرجعة' : 'معلقة'}
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

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>إضافة عهدة جديدة</DialogTitle>
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