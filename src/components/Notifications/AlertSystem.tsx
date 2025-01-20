import React, { useEffect, useState } from 'react'
import {
  Box,
  Alert,
  Snackbar,
  List,
  ListItem,
  ListItemText,
  Typography,
  Badge
} from '@mui/material'
import { supabase } from '../../config/supabaseClient'
import { Product } from '../../types'

export const AlertSystem: React.FC = () => {
  const [lowStockItems, setLowStockItems] = useState<Product[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    checkLowStock()
    // إعداد مراقب في الوقت الحقيقي للتغييرات
    const subscription = supabase
      .channel('product_changes')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'products' },
        handleProductChange
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkLowStock = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .filter('quantity', 'lte', 'minimum_quantity')

    if (!error && data) {
      setLowStockItems(data)
      if (data.length > 0) setOpen(true)
    }
  }

  const handleProductChange = () => {
    checkLowStock()
  }

  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={() => setOpen(false)}
      >
        <Alert severity="warning" sx={{ width: '100%' }}>
          يوجد {lowStockItems.length} منتجات تحت الحد الأدنى للمخزون
        </Alert>
      </Snackbar>

      <Box component="div" sx={{ marginTop: 2 }}>
        <Typography variant="h6">
          تنبيهات المخزون
          <Badge badgeContent={lowStockItems?.length || 0} color="error" sx={{ ml: 2 }} />
        </Typography>
        <List>
          {lowStockItems.map((item) => (
            <ListItem key={item.id}>
              <ListItemText
                primary={item.name}
                secondary={`الكمية الحالية: ${item.quantity} | الحد الأدنى: ${item.minimum_quantity}`}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </>
  )
} 