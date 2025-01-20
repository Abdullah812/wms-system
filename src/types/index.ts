export interface Product {
  id: string
  name: string
  sku: string
  barcode: string
  unit: string
  price: number
  quantity: number
  minimum_quantity: number
  notes?: string
  category: string | null
  location: {
    zone: string
    rack: string
    shelf: string
  }
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
  creator?: { name: string }
  updater?: { name: string }
}

export interface Transaction {
  id: string
  product_id: string
  type: 'IN' | 'OUT' | 'TRANSFER'
  quantity: number
  from_location?: string
  to_location?: string
  created_by: string
  created_at: string
}

export interface User {
  id: string
  email: string
  role: 'admin' | 'supervisor' | 'employee'
  name: string
  created_at: string
  active: boolean
  phone?: string
  last_sign_in_at?: string
  isOnline?: boolean
}
