import React from 'react'
import { Sidebar } from './Sidebar'
import { useAuth } from '../../contexts/AuthContext'

export const Layout: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { session } = useAuth()

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 mr-64">
        <main className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 