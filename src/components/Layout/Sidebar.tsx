import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import {
  HomeIcon,
  CubeIcon,
  ArrowsRightLeftIcon,
  ChartBarIcon,
  UsersIcon,
  ArrowRightOnRectangleIcon,
  KeyIcon
} from '@heroicons/react/24/outline'
import { Drawer, List, ListItem } from '@mui/material'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { Logo } from './Logo'

const navigation = [
  { name: 'لوحة التحكم', href: '/dashboard', icon: HomeIcon },
  { name: 'المنتجات', href: '/products', icon: CubeIcon },
  { name: 'المعاملات', href: '/transactions', icon: ArrowsRightLeftIcon },
  { name: 'التقارير', href: '/reports', icon: ChartBarIcon },
  { name: 'العهد', href: '/custody', icon: KeyIcon },
]

export const Sidebar: React.FC = () => {
  const location = useLocation()
  const { signOut, session } = useAuth()
  const [userRole, setUserRole] = React.useState<string | null>(null)
  const supabase = useSupabaseClient()

  React.useEffect(() => {
    const getUserRole = async () => {
      if (session?.user?.id) {
        console.log('Logged in User ID:', session.user.id)
        console.log('Logged in User Email:', session.user.email)
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', session.user.email)
          .single()

        console.log('Database Response:', { data, error })
        if (!error && data) {
          setUserRole(data.role)
        }
      }
    }

    getUserRole()
  }, [session, supabase])

  console.log('Current Role:', userRole)

  const fullNavigation = userRole === 'admin' 
    ? [...navigation, { name: 'المستخدمين', href: '/users', icon: UsersIcon }]
    : navigation

  return (
    <Drawer 
      variant="permanent"
      className="w-64 lg:w-72"
      sx={{
        '& .MuiDrawer-paper': {
          width: {
            xs: '14rem',    // للشاشات الصغيرة جداً
            sm: '15rem',    // للشاشات الصغيرة
            md: '16rem',    // للشاشات المتوسطة
            lg: '18rem',    // للشاشات الكبيرة
          },
          boxSizing: 'border-box',
          borderLeft: '1px solid #E5E7EB',
          borderRight: 'none',
          display: {
            xs: 'block',    // يظهر دائماً
          }
        }
      }}
    >
      <div className="flex grow flex-col gap-y-3 sm:gap-y-5 overflow-y-auto bg-white px-3 sm:px-6 pb-4">
        <div className="flex h-14 sm:h-16 shrink-0 items-center justify-center border-b border-gray-200">
          <Logo size="sm" className="sm:hidden" />
          <Logo size="md" className="hidden sm:flex" />
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-4 sm:gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {fullNavigation.map((item) => {
                  const isActive = location.pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`
                          group flex items-center gap-x-2 sm:gap-x-3 rounded-md p-2 sm:p-2.5 text-xs sm:text-sm font-medium leading-6
                          transition duration-150 ease-in-out
                          ${isActive
                            ? 'bg-primary-50 text-primary-600'
                            : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                          }
                        `}
                      >
                        <item.icon
                          className={`h-4 w-4 sm:h-5 sm:w-5 shrink-0 transition-colors duration-150
                            ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600'}
                          `}
                        />
                        {item.name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </li>
            <li className="mt-auto border-t border-gray-200 pt-2 sm:pt-3">
              <button
                onClick={() => signOut()}
                className="group -mx-2 flex w-full items-center gap-x-2 sm:gap-x-3 rounded-md p-2 sm:p-2.5 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition duration-150 ease-in-out"
              >
                <ArrowRightOnRectangleIcon
                  className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-gray-400 group-hover:text-primary-600 transition-colors duration-150"
                />
                تسجيل الخروج
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </Drawer>
  )
} 