import React, { useState, useEffect, useMemo } from 'react'
import { supabase } from '../../config/supabaseClient'
import { Product } from '../../types'
import { ResponsiveBar } from '@nivo/bar'
import { 
  DocumentIcon,
  FunnelIcon,
  DocumentArrowDownIcon,
  ArrowDownTrayIcon,
  PrinterIcon
} from '@heroicons/react/24/outline'
import html2pdf from 'html2pdf.js'
import { CubeIcon, ArrowPathIcon, ExclamationTriangleIcon, UserGroupIcon } from '@heroicons/react/24/outline'

export const InventoryReport = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [filters, setFilters] = useState({
    category: '',
    stockStatus: 'all' // all, low, out
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reportType, setReportType] = useState('inventory')
  const [dateRange, setDateRange] = useState({ from: '', to: '' })
  const [location, setLocation] = useState('')
  const [userId, setUserId] = useState('')
  const [summary, setSummary] = useState({
    totalProducts: 0,
    totalTransactions: 0,
    lowStock: 0,
    activeUsers: 0
  })
  const [users, setUsers] = useState<any[]>([])

  useEffect(() => {
    fetchProducts()
    fetchUsers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, products])

  const fetchProducts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name')
    
    if (error) {
      setError('حدث خطأ أثناء جلب البيانات')
    } else {
      setProducts(data || [])
      setFilteredProducts(data || [])
    }
    setLoading(false)
  }

  const applyFilters = () => {
    let filtered = [...products]

    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category)
    }

    switch (filters.stockStatus) {
      case 'low':
        filtered = filtered.filter(p => p.quantity <= p.minimum_quantity && p.quantity > 0)
        break
      case 'out':
        filtered = filtered.filter(p => p.quantity === 0)
        break
    }

    setFilteredProducts(filtered)
  }

  const exportToExcel = () => {
    // تنفيذ تصدير البيانات إلى Excel
    // يمكن استخدام مكتبة مثل xlsx
  }

  const exportToPDF = () => {
    const element = document.getElementById('report-content')
    const opt = {
      margin: 1,
      filename: 'تقرير_المخزون.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { 
        unit: 'in', 
        format: 'a4', 
        orientation: 'portrait',
        language: 'ar'
      }
    }

    html2pdf().set(opt).from(element).save()
  }

  const getCategories = (): string[] => {
    const categories = new Set(products.map(p => p.category).filter((c): c is string => c !== null))
    return Array.from(categories)
  }

  const handleExport = () => {
    // Implementation of handleExport function
  }

  const handlePrint = () => {
    // Implementation of handlePrint function
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // جلب بيانات المستخدمين من الجدول
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
      
      // جلب بيانات المصادقة
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers()
      
      if (usersError || authError) {
        setError('حدث خطأ أثناء جلب البيانات')
      } else if (usersData) {
        // دمج البيانات وتحديد المستخدمين النشطين
        const updatedUsers = usersData.map(user => {
          const authUser = authData?.users?.find(auth => auth.id === user.id)
          const lastSignIn = authUser?.last_sign_in_at
          const isActive = lastSignIn ? 
            (new Date().getTime() - new Date(lastSignIn).getTime()) < (24 * 60 * 60 * 1000) : false

          return {
            ...user,
            last_sign_in_at: lastSignIn,
            active: isActive
          }
        })
        setUsers(updatedUsers)
      }
    } catch (error) {
      setError('حدث خطأ أثناء جلب البيانات')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (reportType === 'users') {
      fetchUsers()
    }
  }, [reportType])

  useEffect(() => {
    // تحديث ملخص التقرير
    setSummary({
      totalProducts: products.length,
      totalTransactions: 0, // يمكن تحديثها من جدول الحركات
      lowStock: products.filter(p => p.quantity <= p.minimum_quantity).length,
      activeUsers: users.filter(u => u.active).length
    })
  }, [products, users])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center justify-between py-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">التقارير</h1>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-base"
          >
            <option value="inventory">تقرير المخزون</option>
            <option value="transactions">تقرير الحركات</option>
            <option value="users">تقرير المستخدمين</option>
          </select>

          <button
            onClick={handleExport}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <ArrowDownTrayIcon className="h-5 w-5 ml-2" />
            تصدير
          </button>

          <button
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-5 py-2.5 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
          >
            <PrinterIcon className="h-5 w-5 ml-2" />
            طباعة
          </button>
        </div>
      </div>

      {/* فلاتر إضافية */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            من تاريخ
          </label>
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            إلى تاريخ
          </label>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            الموقع
          </label>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">الكل</option>
            {/* Add your locations here */}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            المستخدم
          </label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">الكل</option>
            {/* Add your users here */}
          </select>
        </div>
      </div>

      {/* ملخص التقرير */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CubeIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="mr-5">
                <p className="text-sm font-medium text-gray-500 truncate">إجمالي المنتجات</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{summary.totalProducts}</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowPathIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="mr-5">
                <p className="text-sm font-medium text-gray-500 truncate">عدد الحركات</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{summary.totalTransactions}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="mr-5">
                <p className="text-sm font-medium text-gray-500 truncate">منتجات تحت الحد</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{summary.lowStock}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserGroupIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="mr-5">
                <p className="text-sm font-medium text-gray-500 truncate">المستخدمين النشطين</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">{summary.activeUsers}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* محتوى التقرير */}
      <div className="mt-8">
        {loading ? (
          <div className="bg-white p-8 rounded-lg shadow-sm flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="mr-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {reportType === 'inventory' && (
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                {/* رأس الجدول */}
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center space-x-4 space-x-reverse mb-4 sm:mb-0">
                      <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                        className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="">جميع الفئات</option>
                        {getCategories().map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                      <select
                        value={filters.stockStatus}
                        onChange={(e) => setFilters({ ...filters, stockStatus: e.target.value })}
                        className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                      >
                        <option value="all">جميع المنتجات</option>
                        <option value="low">تحت الحد الأدنى</option>
                        <option value="out">نفذت الكمية</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* جدول المنتجات */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 pr-4 pl-3 text-right text-sm font-semibold text-gray-900">المنتج</th>
                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">الباركود</th>
                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">الفئة</th>
                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">الكمية</th>
                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">الحد الأدنى</th>
                        <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">الموقع</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="py-4 pr-4 pl-3">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.sku}</div>
                          </td>
                          <td className="px-3 py-4">
                            <div className="text-sm font-mono text-gray-900">{product.barcode}</div>
                          </td>
                          <td className="px-3 py-4">
                            <div className="text-sm text-gray-900">{product.category}</div>
                          </td>
                          <td className="px-3 py-4">
                            <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                              product.quantity <= product.minimum_quantity
                                ? product.quantity === 0
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {product.quantity}
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            <div className="text-sm text-gray-900">{product.minimum_quantity}</div>
                          </td>
                          <td className="px-3 py-4">
                            <div className="text-sm text-gray-900">
                              {product.location ? `${product.location.zone} - ${product.location.rack} - ${product.location.shelf}` : 'غير محدد'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* رسم بياني */}
                <div className="h-96 p-4 border-t border-gray-200">
                  <ResponsiveBar
                    data={filteredProducts.map(p => ({
                      name: p.name,
                      quantity: p.quantity
                    }))}
                    keys={['quantity']}
                    indexBy="name"
                    margin={{ top: 50, right: 130, bottom: 50, left: 60 }}
                    padding={0.3}
                    valueScale={{ type: 'linear' }}
                    indexScale={{ type: 'band', round: true }}
                    colors={{ scheme: 'nivo' }}
                    borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: -45,
                      legend: 'المنتج',
                      legendPosition: 'middle',
                      legendOffset: 45
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 5,
                      tickRotation: 0,
                      legend: 'الكمية',
                      legendPosition: 'middle',
                      legendOffset: -40
                    }}
                    labelSkipWidth={12}
                    labelSkipHeight={12}
                    labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                    legends={[
                      {
                        dataFrom: 'keys',
                        anchor: 'bottom-right',
                        direction: 'column',
                        justify: false,
                        translateX: 120,
                        translateY: 0,
                        itemsSpacing: 2,
                        itemWidth: 100,
                        itemHeight: 20,
                        itemDirection: 'left-to-right',
                        itemOpacity: 0.85,
                        symbolSize: 20,
                        effects: [
                          {
                            on: 'hover',
                            style: {
                              itemOpacity: 1
                            }
                          }
                        ]
                      }
                    ]}
                  />
                </div>
              </div>
            )}

            {reportType === 'users' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pr-4 pl-3 text-right text-sm font-semibold text-gray-900">المستخدم</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">البريد الإلكتروني</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">الصلاحية</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">آخر دخول</th>
                      <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="py-4 pr-4 pl-3">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                                <span className="text-lg font-medium text-primary-700">{user.name.charAt(0)}</span>
                              </span>
                            </div>
                            <div className="mr-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">{user.email}</td>
                        <td className="px-3 py-4">
                          <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold text-blue-800">
                            {user.role}
                          </span>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500">
                          {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('ar-SA') : 'لم يسجل دخول'}
                        </td>
                        <td className="px-3 py-4">
                          <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${
                            user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.active ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}