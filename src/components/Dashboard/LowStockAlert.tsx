import React from 'react'
import { Typography, List, ListItem, ListItemText } from '@mui/material'

interface LowStockAlertProps {
  lowStockProducts: any[];
}

export const LowStockAlert: React.FC<LowStockAlertProps> = ({ lowStockProducts }) => {
  return (
    <div>
      <Typography variant="h6" gutterBottom>
        تنبيهات المخزون
      </Typography>
      <List>
        {lowStockProducts.length === 0 ? (
          <ListItem>
            <ListItemText primary="لا توجد منتجات منخفضة المخزون" />
          </ListItem>
        ) : (
          lowStockProducts.map((product) => (
            <ListItem key={product.id}>
              <ListItemText 
                primary={product.name}
                secondary={`الكمية: ${product.quantity}`}
              />
            </ListItem>
          ))
        )}
      </List>
    </div>
  )
}