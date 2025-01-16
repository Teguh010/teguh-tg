import type { NextApiRequest, NextApiResponse } from 'next'
import { relogin } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 1. Login untuk mendapatkan token baru
    const authResponse = await relogin({
      username: process.env.SERVICE_USERNAME!,
      password: process.env.SERVICE_PASSWORD!,
      customer: process.env.SERVICE_CUSTOMER!
    })

    if (!authResponse?.token) {
      throw new Error('Failed to get token')
    }

    // 2. Generate report menggunakan token yang baru
    const today = new Date()
    const response = await fetch(`${process.env.SITE_URL}/api/scheduler/report/trip_stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: authResponse.token,
        schedule_date: today.toISOString().split('T')[0],
        format: 'pdf',
        email: process.env.REPORT_EMAIL
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate report')
    }

    return res.status(200).json({
      message: 'Report generated and sent successfully'
    })
  } catch (error: any) {
    console.error('Error:', error)
    return res.status(500).json({
      error: 'Failed to generate report',
      details: error.message
    })
  }
}
