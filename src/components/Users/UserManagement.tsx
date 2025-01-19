import React, { useState, useEffect } from 'react'
import { supabase } from '../../config/supabaseClient'
import { User } from '../../types'
import {
  PencilIcon,
  TrashIcon,
  UserPlusIcon as UserAddIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline'
import { Dialog } from '@mui/material'

export const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([])
  const [openDialog, setOpenDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'employee'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    const { data: authData } = await supabase
      .auth.admin.listUsers()
    
    // استخدام getSession للتحقق من الجلسة الحالية
    const { data: currentSession } = await supabase.auth.getSession()
    console.log('Current Session:', currentSession)
    
    if (!usersError && usersData) {
      const updatedUsers = usersData.map(user => {
        const authUser = authData?.users?.find(auth => auth.id === user.id)
        const isOnline = currentSession?.session?.user.id === user.id
        
        console.log(`User ${user.email} session:`, isOnline)

        return {
          ...user,
          active: user.active ?? true,
          last_sign_in_at: authUser?.last_sign_in_at,
          isOnline
        }
      })
      setUsers(updatedUsers)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const cleanEmail = formData.email.trim().toLowerCase()

    try {
      if (editingUser) {
        await handleEdit(editingUser)
      } else {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: cleanEmail,
          password: formData.password,
          email_confirm: true,
          user_metadata: {
            name: formData.name.trim(),
            role: formData.role,
            active: true
          }
        })

        if (authError) throw authError

        if (authData.user) {
          const { error: profileError } = await supabase
            .from('users')
            .insert([{
              id: authData.user.id,
              name: formData.name.trim(),
              email: cleanEmail,
              role: formData.role,
              active: true
            }])

          if (profileError) throw profileError
        }

        setSuccess('تم إنشاء المستخدم بنجاح')
        setOpenDialog(false)
        await fetchUsers()
      }
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message || 'حدث خطأ أثناء معالجة الطلب')
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      try {
        // حذف المستخدم من جدول المستخدمين أولاً
        const { error: profileError } = await supabase
          .from('users')
          .delete()
          .eq('id', id)

        if (profileError) throw profileError

        // ثم حذف المستخدم من Auth
        const { error: authError } = await supabase.auth.admin.deleteUser(id)
        if (authError) {
          // إذا فشل حذف المستخدم من Auth، نعيد إضافته للجدول
          console.error('Auth deletion failed:', authError)
          throw new Error('فشل حذف المستخدم من النظام')
        }

        setSuccess('تم حذف المستخدم بنجاح')
        await fetchUsers()
      } catch (error: any) {
        console.error('Error:', error)
        
        // رسائل خطأ أكثر تفصيلاً
        if (error.message.includes('foreign key')) {
          setError('لا يمكن حذف المستخدم لوجود بيانات مرتبطة به')
        } else if (error.message.includes('not found')) {
          setError('المستخدم غير موجود')
        } else {
          setError(error.message || 'فشل حذف المستخدم')
        }

        // محاولة استعادة البيانات في حالة الفشل
        await fetchUsers()
      }
    }
  }

  const handleEdit = async (user: User) => {
    try {
      setError('')
      setSuccess('')

      // تحديث بيانات المستخدم في Auth
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        {
          email: formData.email.trim().toLowerCase(),
          password: formData.password || undefined,
          user_metadata: {
            name: formData.name.trim(),
            role: formData.role,
            active: user.active
          }
        }
      )

      if (updateError) throw updateError

      // تحديث بيانات المستخدم في الجدول
      const { error: profileError } = await supabase
        .from('users')
        .update({
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          role: formData.role,
          active: true
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      setSuccess('تم تحديث المستخدم بنجاح')
      setOpenDialog(false)
      await fetchUsers()
    } catch (error: any) {
      console.error('Error updating user:', error)
      
      if (error.message.includes('duplicate key')) {
        setError('البريد الإلكتروني مستخدم بالفعل')
      } else if (error.message.includes('invalid email')) {
        setError('البريد الإلكتروني غير صالح')
      } else if (error.message.includes('password')) {
        setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل')
      } else {
        setError(error.message || 'حدث خطأ أثناء تحديث المستخدم')
      }
    }
  }

  const handleToggleStatus = async (id: string, active: boolean) => {
    try {
      // تحديث حالة المستخدم في Auth metadata
      const { error: authError } = await supabase.auth.admin.updateUserById(
        id,
        {
          user_metadata: {
            active: active
          }
        }
      )

      if (authError) throw authError

      // تحديث حالة المستخدم في الجدول
      const { error: profileError } = await supabase
        .from('users')
        .update({ active: active })
        .eq('id', id)

      if (profileError) throw profileError
      
      await fetchUsers()
      setSuccess(active ? 'تم تنشيط المستخدم بنجاح' : 'تم إلغاء تنشيط المستخدم بنجاح')
    } catch (error: any) {
      console.error('Error:', error)
      setError(`فشل تغيير حالة المستخدم: ${error.message}`)
    }
  }

  const handleOpenDialog = (user: User | null) => {
    if (user) {
      setFormData({
        email: user.email,
        password: '',
        name: user.name,
        role: user.role
      })
      setEditingUser(user)
    } else {
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'employee'
      })
      setEditingUser(null)
    }
    setOpenDialog(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* العنوان والأزرار */}
      <div className="sm:flex sm:items-center justify-between py-6">
        <div className="sm:flex-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">إدارة المستخدمين</h1>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => handleOpenDialog(null)}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-5 py-2.5 text-base font-medium text-white shadow-sm hover:bg-primary-700 transition-colors"
          >
            <UserAddIcon className="h-5 w-5 ml-2" />
            إضافة مستخدم
          </button>
        </div>
      </div>

      {/* رسائل الخطأ والنجاح */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <div className="mr-3">
              <div className="text-base font-medium text-red-800">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* جدول المستخدمين للشاشات الكبيرة */}
      <div className="hidden md:block mt-4">
        <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-4 pr-4 pl-3 text-right text-base font-semibold text-gray-900 w-1/4">
                  المستخدم
                </th>
                <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900 w-1/4">
                  البريد الإلكتروني
                </th>
                <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900 w-1/5">
                  الصلاحية
                </th>
                <th scope="col" className="px-3 py-4 text-right text-base font-semibold text-gray-900 w-1/5">
                  الحالة
                </th>
                <th scope="col" className="relative py-4 pl-3 pr-4 w-24">
                  <span className="sr-only">إجراءات</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap py-4 pr-4 pl-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-500">
                          <span className="text-lg font-medium leading-none text-white">
                            {user.name.charAt(0)}
                          </span>
                        </span>
                      </div>
                      <div className="mr-4">
                        <div className="text-base font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">
                          {user.last_sign_in_at ? (
                            <span>
                              آخر دخول: {new Date(user.last_sign_in_at).toLocaleString('ar-SA', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          ) : 'لم يسجل الدخول بعد'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {user.email}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                        user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.active ? 'نشط' : 'غير نشط'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                        user.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isOnline ? 'متصل' : 'غير متصل'}
                      </span>
                    </div>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenDialog(user)}
                        className="text-primary-600 hover:text-primary-900 transition-colors"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(user.id, !user.active)}
                        className="text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {user.active ? (
                          <LockClosedIcon className="h-5 w-5" />
                        ) : (
                          <LockOpenIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* عرض المستخدمين للجوال */}
      <div className="md:hidden space-y-4 mt-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white shadow-sm border rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-500">
                  <span className="text-xl font-medium text-white">
                    {user.name.charAt(0)}
                  </span>
                </span>
                <div className="mr-3">
                  <div className="text-lg font-semibold text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">
                    {user.last_sign_in_at ? (
                      <span>
                        آخر دخول: {new Date(user.last_sign_in_at).toLocaleString('ar-SA', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    ) : 'لم يسجل الدخول بعد'}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenDialog(user)}
                  className="p-1.5 rounded-full text-primary-600 hover:bg-primary-50"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="p-1.5 rounded-full text-red-600 hover:bg-red-50"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleToggleStatus(user.id, !user.active)}
                  className="p-1.5 rounded-full text-gray-600 hover:bg-gray-50"
                >
                  {user.active ? (
                    <LockClosedIcon className="h-5 w-5" />
                  ) : (
                    <LockOpenIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">البريد الإلكتروني</span>
                <span className="text-sm font-medium text-gray-900">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">الصلاحية</span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {user.role}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">الحالة</span>
                <div className="flex gap-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                    user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.active ? 'نشط' : 'غير نشط'}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                    user.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.isOnline ? 'متصل' : 'غير متصل'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">تاريخ الإنشاء</span>
                <span className="text-sm text-gray-900">
                  {new Date(user.created_at).toLocaleString('ar-SA', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* نافذة إضافة/تعديل المستخدم */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        keepMounted={false}
        disablePortal={false}
        aria-labelledby="user-dialog-title"
      >
        <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
          <div className="mb-5">
            <h3 className="text-lg lg:text-xl font-bold text-gray-900">
              {editingUser ? 'تعديل مستخدم' : 'إضافة مستخدم جديد'}
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                البريد الإلكتروني
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required={!editingUser}
                disabled={!!editingUser}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                كلمة المرور
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required={!editingUser}
              />
              {editingUser && (
                <p className="mt-1 text-sm text-gray-500">
                  اتركها فارغة إذا لم ترد تغييرها
                </p>
              )}
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                الاسم
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                الدور
              </label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                required
              >
                <option value="admin">مدير</option>
                <option value="supervisor">مشرف</option>
                <option value="employee">موظف</option>
              </select>
            </div>

            <div className="mt-6 sm:mt-8 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <button
                type="submit"
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2.5 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors sm:col-start-2 sm:text-sm"
              >
                {editingUser ? 'تحديث' : 'إضافة'}
              </button>
              <button
                type="button"
                onClick={() => setOpenDialog(false)}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2.5 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors sm:col-start-1 sm:mt-0 sm:text-sm"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  )
} 