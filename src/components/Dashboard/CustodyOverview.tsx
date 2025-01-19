import React, { useEffect, useState } from 'react'
import { Box, Card, CardContent, Typography, Grid } from '@mui/material'
import { useSupabaseClient } from '@supabase/auth-helpers-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface CustodyStats {
  active: number
  returned: number
  damaged: number
}

const COLORS = ['#4caf50', '#2196f3', '#f44336']

export const CustodyOverview: React.FC = () => {
  const supabase = useSupabaseClient()
  const [stats, setStats] = useState<CustodyStats>({
    active: 0,
    returned: 0,
    damaged: 0
  })

  useEffect(() => {
    const fetchCustodyStats = async () => {
      try {
        const { data, error } = await supabase
          .from('custody')
          .select('status')

        if (error) throw error

        const counts = data.reduce((acc: CustodyStats, curr) => {
          acc[curr.status as keyof CustodyStats]++
          return acc
        }, { active: 0, returned: 0, damaged: 0 })

        setStats(counts)
      } catch (error) {
        console.error('Error fetching custody stats:', error)
      }
    }

    fetchCustodyStats()
  }, [supabase])

  const chartData = [
    { name: 'نشط', value: stats.active },
    { name: 'مرتجع', value: stats.returned },
    { name: 'تالف', value: stats.damaged }
  ]

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          إحصائيات العهد
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => 
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box>
                <Typography color="#4caf50" variant="subtitle1">
                  العهد النشطة
                </Typography>
                <Typography variant="h4">{stats.active}</Typography>
              </Box>
              <Box>
                <Typography color="#2196f3" variant="subtitle1">
                  العهد المرتجعة
                </Typography>
                <Typography variant="h4">{stats.returned}</Typography>
              </Box>
              <Box>
                <Typography color="#f44336" variant="subtitle1">
                  العهد التالفة
                </Typography>
                <Typography variant="h4">{stats.damaged}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
} 