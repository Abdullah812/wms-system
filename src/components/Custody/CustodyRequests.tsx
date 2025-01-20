import React, { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useAuth } from '../../contexts/AuthContext'
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface CustodyRequest {
  id: string
  item_name: string
  quantity: number
  assigned_to: string
  status: 'pending'
  notes: string
  created_at: string
  created_by: string
  assignee?: { name: string }
  requester?: { name: string }
}

export const CustodyRequests: React.FC = () => {
  const supabase = useSupabaseClient()
  const { session } = useAuth()
  const [requests, setRequests] = useState<CustodyRequest[]>([])

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    const { data, error } = await supabase
      .from('custody')
      .select(`
        *,
        assignee:assigned_to(name),
        requester:created_by(name)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pending requests:', error)
      return
    }
    setRequests(data || [])
  }

  const handleApproval = async (id: string, newStatus: 'active' | 'rejected') => {
    const { data: custodyItem } = await supabase
      .from('custody')
      .select('*')
      .eq('id', id)
      .single()

    if (!custodyItem) return

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

    fetchPendingRequests()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center justify-between py-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">طلبات العهد</h1>
          <p className="mt-2 text-sm text-gray-700">
            قائمة بجميع طلبات العهد التي تحتاج إلى موافقة
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-right text-sm font-semibold text-gray-900">
                الصنف
              </th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                الكمية
              </th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                المستلم
              </th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                مقدم الطلب
              </th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                تاريخ الطلب
              </th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                ملاحظات
              </th>
              <th className="relative py-3.5 pl-3 pr-4">
                <span className="sr-only">إجراءات</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {requests.map((request) => (
              <tr key={request.id}>
                <td className="py-4 pl-4 pr-3 text-sm">
                  <div className="font-medium text-gray-900">{request.item_name}</div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">{request.quantity}</td>
                <td className="px-3 py-4 text-sm">
                  <div className="flex items-center">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary-100">
                      <span className="text-sm font-medium text-primary-700">
                        {request.assignee?.name.charAt(0)}
                      </span>
                    </span>
                    <div className="mr-3">
                      <div className="font-medium text-gray-900">{request.assignee?.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">{request.requester?.name}</td>
                <td className="px-3 py-4 text-sm text-gray-500">
                  {new Date(request.created_at).toLocaleDateString('ar-SA')}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500">{request.notes || '-'}</td>
                <td className="py-4 pl-3 pr-4 text-right text-sm">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleApproval(request.id, 'active')}
                      className="p-1.5 rounded-full text-green-600 hover:bg-green-50"
                      title="موافقة"
                    >
                      <CheckIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleApproval(request.id, 'rejected')}
                      className="p-1.5 rounded-full text-red-600 hover:bg-red-50"
                      title="رفض"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 