import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
    console.log('بدء إنشاء المستخدم المدير...')
    
    try {
        // محاولة إنشاء المستخدم
        const { data, error } = await supabase.auth.admin.createUser({
            email: 'admin@example.com',
            password: 'admin123456',
            email_confirm: true
        })

        if (error) {
            console.error('خطأ في إنشاء المستخدم:', error.message)
            return
        }

        console.log('تم إنشاء المستخدم في نظام المصادقة:', data.user.id)

        // إضافة معلومات المستخدم في جدول users
        const { error: profileError } = await supabase
            .from('users')
            .insert({
                id: data.user.id,
                email: 'admin@example.com',
                role: 'admin',
                name: 'مدير النظام'
            })

        if (profileError) {
            console.error('خطأ في إضافة بيانات المستخدم:', profileError.message)
            return
        }

        console.log('تم إنشاء المستخدم المدير بنجاح!')
        console.log('البريد الإلكتروني: admin@example.com')
        console.log('كلمة المرور: admin123456')

    } catch (error) {
        console.error('خطأ غير متوقع:', error)
    }
}

main() 