import React, { useEffect, useState } from 'react'
import {
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip
} from '@mui/material'
import { supabase } from '../../config/supabaseClient'
import { Transaction } from '../../types'

export const RecentTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<any[]>([])

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

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'IN':
        return 'success'
      case 'OUT':
        return 'error'
      case 'TRANSFER':
        return 'info'
      default:
        return 'default'
    }
  }

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'IN':
        return 'وارد'
      case 'OUT':
        return 'صادر'
      case 'TRANSFER':
        return 'نقل'
      default:
        return type
    }
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        آخر المعاملات
      </Typography>
      
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>المنتج</TableCell>
            <TableCell>نوع المعاملة</TableCell>
            <TableCell>الكمية</TableCell>
            <TableCell>من</TableCell>
            <TableCell>إلى</TableCell>
            <TableCell>بواسطة</TableCell>
            <TableCell>التاريخ</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>{transaction.products?.name}</TableCell>
              <TableCell>
                <Chip
                  label={getTransactionTypeLabel(transaction.type)}
                  color={getTransactionTypeColor(transaction.type)}
                  size="small"
                />
              </TableCell>
              <TableCell>{transaction.quantity}</TableCell>
              <TableCell>{transaction.from_location || '-'}</TableCell>
              <TableCell>{transaction.to_location || '-'}</TableCell>
              <TableCell>{transaction.users?.name}</TableCell>
              <TableCell>
                {new Date(transaction.created_at).toLocaleDateString('ar-SA')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
} 