import React, { useEffect, useState } from 'react'
import { useSupabaseClient } from '@supabase/auth-helpers-react'

interface CustodyStats {
  pending: number
  active: number
  returned: number
  rejected: number
}

export const CustodyOverview: React.FC = () => {
  const supabase = useSupabaseClient()
  const [stats, setStats] = useState<CustodyStats>({
    pending: 0, active: 0, returned: 0, rejected: 0
  })

  useEffect(() => {
    const fetchCustodyStats = async () => {
      const { data, error } = await supabase.from('custody').select('status')
      if (!error) {
        const counts = data.reduce((acc: CustodyStats, curr) => {
          acc[curr.status as keyof CustodyStats]++
          return acc
        }, { pending: 0, active: 0, returned: 0, rejected: 0 })
        setStats(counts)
      }
    }
    fetchCustodyStats()
  }, [supabase])

  return (
    <div className="card">
      <div className="card-content">
        <h2>إحصائيات العهد</h2>
        <div className="stats">
          <p>العهد المعلقة: {stats.pending}</p>
          <p>العهد النشطة: {stats.active}</p>
          <p>العهد المرتجعة: {stats.returned}</p>
          <p>العهد المرفوضة: {stats.rejected}</p>
        </div>
      </div>
    </div>
  )
}