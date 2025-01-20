import React, { useEffect, useState } from 'react'
import { supabase } from '../../config/supabaseClient'

interface Transaction {
  id: string
  users?: { name: string }
  created_at: string
  type: 'IN' | 'OUT' | 'TRANSFER'
  products?: { name: string }
  quantity: number
  from_location?: string
  to_location?: string
}

export const RecentTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    fetchRecentTransactions()
  }, [])

  const fetchRecentTransactions = async () => {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        products (name),
        users (name)
      `)
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (!error && data) {
      setTransactions(data)
    }
  }

  const getStatusClass = (type: Transaction['type']) => {
    switch (type) {
      case 'IN':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'OUT':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'TRANSFER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  const getTransactionTypeLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'IN': return 'وارد'
      case 'OUT': return 'صادر'
      case 'TRANSFER': return 'نقل'
      default: return type
    }
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th scope="col" className="px-6 py-3 text-right">المنتج</th>
            <th scope="col" className="px-6 py-3 text-right">نوع المعاملة</th>
            <th scope="col" className="px-6 py-3 text-right">الكمية</th>
            <th scope="col" className="px-6 py-3 text-right">من</th>
            <th scope="col" className="px-6 py-3 text-right">إلى</th>
            <th scope="col" className="px-6 py-3 text-right">بواسطة</th>
            <th scope="col" className="px-6 py-3 text-right">التاريخ</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b">
              <td className="px-6 py-4 whitespace-nowrap text-right">{transaction.products?.name || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusClass(transaction.type)}`}>
                  {getTransactionTypeLabel(transaction.type)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">{transaction.quantity}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right">{transaction.from_location || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right">{transaction.to_location || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right">{transaction.users?.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                {new Date(transaction.created_at).toLocaleDateString('ar-SA')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}