import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { InventoryOverview } from "./InventoryOverview"
import { RecentTransactions } from "./RecentTransactions"
import { LowStockAlert } from "./LowStockAlert"
import { CustodyOverview } from "./CustodyOverview"

export const Dashboard: React.FC = () => {
  return (
    <div className="flex-1 h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="h-full">
        {/* العنوان الرئيسي مع تأثيرات */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent">
            لوحة التحكم
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            مرحباً بك في نظام إدارة المخزون
          </p>
          <div className="w-64 h-1 mx-auto bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
        </div>

        {/* البطاقات الإحصائية */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="group overflow-hidden border-none bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">إجمالي المنتجات</CardTitle>
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-full group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                >
                  <path d="M12 2v20M2 12h20" />
                </svg>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                1,234
              </div>
              <div className="flex items-center mt-3 text-sm">
                <span className="flex items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  20.1%
                </span>
                <span className="mr-2 text-gray-600 dark:text-gray-400">من الشهر الماضي</span>
              </div>
            </CardContent>
          </Card>

          <Card className="group overflow-hidden border-none bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">المنتجات منخفضة المخزون</CardTitle>
              <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 rounded-full group-hover:scale-110 transition-transform duration-300">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="w-5 h-5 text-amber-600 dark:text-amber-400"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="text-3xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-300">
                45
              </div>
              <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 font-medium">
                يحتاج إلى مراجعة
              </p>
            </CardContent>
          </Card>
        </div>

        {/* المعاملات الأخيرة */}
        <div>
          <Card className="border-none bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <span className="w-1.5 h-6 bg-purple-500 rounded-full" />
                المعاملات الأخيرة
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <RecentTransactions />
            </CardContent>
          </Card>
        </div>

        {/* نظرة عامة والعهد */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <Card className="border-none bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <span className="w-1.5 h-6 bg-green-500 rounded-full" />
                نظرة عامة على المخزون
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <InventoryOverview />
            </CardContent>
          </Card>

          <Card className="border-none bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl hover:shadow-xl transition-all duration-300">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <span className="w-1.5 h-6 bg-pink-500 rounded-full" />
                العهد
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <CustodyOverview />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 