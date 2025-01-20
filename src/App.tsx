import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Box, CssBaseline } from '@mui/material'
import { Login } from './components/Auth/Login'
import { Dashboard } from './components/Dashboard/Dashboard'
import { ProductManagement } from './components/Products/ProductManagement'
import { TransactionForm } from './components/Transactions/TransactionForm'
import { InventoryReport } from './components/Reports/InventoryReport'
import { UserManagement } from './components/Users/UserManagement'
import { Sidebar } from './components/Layout/Sidebar'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { useSession } from '@supabase/auth-helpers-react'
import { CustodyManagement } from './components/Custody/CustodyManagement'
import { CustodyRequests } from './components/Custody/CustodyRequests'

const PrivateRoute: React.FC<{ 
  children: React.ReactElement,
  requireAdmin?: boolean 
}> = ({ children, requireAdmin }) => {
  const session = useSession()
  const supabase = useSupabaseClient()
  const [userRole, setUserRole] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const getUserRole = async () => {
      if (session?.user?.email) {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('email', session.user.email)
          .single()

        if (!error && data) {
          setUserRole(data.role)
        }
        setLoading(false)
      }
    }

    getUserRole()
  }, [session, supabase])

  if (!session) {
    return <Navigate to="/login" />
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (requireAdmin && userRole !== 'admin') {
    return <Navigate to="/dashboard" />
  }

  return children
}

const Layout: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  return (
    <div className="flex">
      <CssBaseline />
      <Sidebar />
      <div className="flex-grow p-3">
        {children}
      </div>
    </div>
  )
}

export const App: React.FC = () => {
  const supabase = useSupabaseClient()
  const [isLoading, setIsLoading] = React.useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session && window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      } catch (error) {
        console.error('Session check error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' && window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  if (isLoading) {
    return <div>جاري التحميل...</div>
  }

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/products" element={
            <PrivateRoute>
              <Layout>
                <ProductManagement />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/transactions" element={
            <PrivateRoute>
              <Layout>
                <TransactionForm />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/reports" element={
            <PrivateRoute>
              <Layout>
                <InventoryReport />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/users" element={
            <PrivateRoute requireAdmin={true}>
              <Layout>
                <UserManagement />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/custody" element={
            <PrivateRoute>
              <Layout>
                <CustodyManagement />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/custody-requests" element={
            <PrivateRoute requireAdmin={true}>
              <Layout>
                <CustodyRequests />
              </Layout>
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
