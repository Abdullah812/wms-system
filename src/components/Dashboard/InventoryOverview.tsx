import React, { useEffect, useState } from 'react'
import { Typography, Box, Grid, Card, CardContent } from '@mui/material'
import { ResponsivePie } from '@nivo/pie'
import { supabase } from '../../config/supabaseClient'
import { CubeIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const StatCard: React.FC<{
  title: string
  value: string | number
  icon: React.ElementType
  color: string
}> = ({ title, value, icon: Icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Icon style={{ width: 24, height: 24, color }} />
        <Typography variant="h6" sx={{ mr: 1, color }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
    </CardContent>
  </Card>
)

interface Stats {
  totalProducts: number
  incomingProducts: number
  outgoingProducts: number
  lowStockAlerts: number
}

interface TransactionData {
  date: string
  incoming: number
  outgoing: number
}

export const InventoryOverview: React.FC = () => {
  const supabase = useSupabaseClient()
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    incomingProducts: 0,
    outgoingProducts: 0,
    lowStockAlerts: 0
  })
  const [chartData, setChartData] = useState<TransactionData[]>([])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // إجمالي المنتجات
        const { count: totalProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })

        // المنتجات الواردة (آخر 30 يوم)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const { count: incomingProducts } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'IN')
          .gte('created_at', thirtyDaysAgo.toISOString())

        // المنتجات الصادرة (آخر 30 يوم)
        const { count: outgoingProducts } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('type', 'OUT')
          .gte('created_at', thirtyDaysAgo.toISOString())

        // تنبيهات المخزون المنخفض
        const { count: lowStockAlerts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .lt('quantity', 'minimum_quantity')

        setStats({
          totalProducts: totalProducts || 0,
          incomingProducts: incomingProducts || 0,
          outgoingProducts: outgoingProducts || 0,
          lowStockAlerts: lowStockAlerts || 0
        })

      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    const fetchChartData = async () => {
      try {
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: transactions } = await supabase
          .from('transactions')
          .select('created_at, type, quantity')
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at')

        if (transactions) {
          const groupedData = transactions.reduce((acc: { [key: string]: { incoming: number, outgoing: number } }, curr) => {
            const date = new Date(curr.created_at).toLocaleDateString('ar-SA')
            if (!acc[date]) {
              acc[date] = { incoming: 0, outgoing: 0 }
            }
            if (curr.type === 'IN') {
              acc[date].incoming += curr.quantity
            } else if (curr.type === 'OUT') {
              acc[date].outgoing += curr.quantity
            }
            return acc
          }, {})

          const formattedData = Object.entries(groupedData).map(([date, values]) => ({
            date,
            incoming: values.incoming,
            outgoing: values.outgoing
          }))

          setChartData(formattedData)
        }
      } catch (error) {
        console.error('Error fetching chart data:', error)
      }
    }

    fetchStats()
    fetchChartData()
  }, [supabase])

  return (
    <div className="space-y-6">
      {/* الإحصائيات المصغرة */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          className="group relative p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`} />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">إجمالي المنتجات</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                {stats.totalProducts}
              </p>
            </div>
            
            <div className={`p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:scale-110 transition-transform duration-300`}>
              <CubeIcon className={`w-6 h-6 text-blue-600 dark:text-blue-400`} />
            </div>
          </div>

          <div className="mt-4 flex items-center">
            <ArrowTrendingUpIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className={`mr-1 text-sm font-medium ${'text-green-600 dark:text-green-400'}`}>
              +12% من الشهر الماضي
            </span>
          </div>
        </div>

        <div
          className="group relative p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`} />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">المنتجات المنخفضة</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                {stats.lowStockAlerts}
              </p>
            </div>
            
            <div className={`p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full group-hover:scale-110 transition-transform duration-300`}>
              <ExclamationTriangleIcon className={`w-6 h-6 text-amber-600 dark:text-amber-400`} />
            </div>
          </div>

          <div className="mt-4 flex items-center">
            <span className={`mr-1 text-sm font-medium ${'text-amber-600 dark:text-amber-400'}`}>
              يحتاج إلى مراجعة
            </span>
          </div>
        </div>

        <div
          className="group relative p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`} />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">المنتجات الواردة</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                {stats.incomingProducts}
              </p>
            </div>
            
            <div className={`p-3 bg-green-100 dark:bg-green-900/30 rounded-full group-hover:scale-110 transition-transform duration-300`}>
              <ArrowTrendingUpIcon className={`w-6 h-6 text-green-600 dark:text-green-400`} />
            </div>
          </div>

          <div className="mt-4 flex items-center">
            <span className={`mr-1 text-sm font-medium ${'text-green-600 dark:text-green-400'}`}>
              +12% من الشهر الماضي
            </span>
          </div>
        </div>

        <div
          className="group relative p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
        >
          <div className={`absolute inset-0 bg-gradient-to-r from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl`} />
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">المنتجات الصادرة</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                {stats.outgoingProducts}
              </p>
            </div>
            
            <div className={`p-3 bg-red-100 dark:bg-red-900/30 rounded-full group-hover:scale-110 transition-transform duration-300`}>
              <ArrowTrendingDownIcon className={`w-6 h-6 text-red-600 dark:text-red-400`} />
            </div>
          </div>

          <div className="mt-4 flex items-center">
            <span className={`mr-1 text-sm font-medium ${'text-red-600 dark:text-red-400'}`}>
              -12% من الشهر الماضي
            </span>
          </div>
        </div>
      </div>

      {/* الرسم البياني */}
      <div className="rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            حركة المخزون
          </h3>
          <select className="text-sm border-gray-200 dark:border-gray-700 rounded-lg focus:ring-primary-500">
            <option>آخر 7 أيام</option>
            <option>آخر 30 يوم</option>
            <option>آخر 3 أشهر</option>
          </select>
        </div>
        
        <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                style={{ fontFamily: 'Cairo' }}
              />
              <YAxis style={{ fontFamily: 'Cairo' }} />
              <Tooltip 
                contentStyle={{ fontFamily: 'Cairo', textAlign: 'right' }}
                formatter={(value: number) => [`${value} قطعة`, '']}
                labelStyle={{ fontFamily: 'Cairo' }}
              />
              <Legend 
                formatter={(value) => value === 'incoming' ? 'وارد' : 'صادر'}
              />
              <Line 
                type="monotone" 
                dataKey="incoming" 
                stroke="#4caf50" 
                strokeWidth={2}
                name="وارد"
              />
              <Line 
                type="monotone" 
                dataKey="outgoing" 
                stroke="#f44336" 
                strokeWidth={2}
                name="صادر"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* قائمة المنتجات الأكثر حركة */}
      <div className="rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg border border-gray-100 dark:border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          المنتجات الأكثر حركة
        </h3>
        
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="flex items-center space-x-3 space-x-reverse">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">اسم المنتج</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">الفئة</p>
                </div>
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 dark:text-white">234 وحدة</p>
                <p className="text-sm text-green-600 dark:text-green-400">+12%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 