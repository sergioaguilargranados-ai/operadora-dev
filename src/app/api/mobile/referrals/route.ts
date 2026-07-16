import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')

  if (!userId) {
    return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 })
  }

  try {
    // 1. Get user referral stats
    const userResult = await db.queryOne(
      'SELECT id, name, referral_code, member_points, wallet_balance FROM users WHERE id = $1',
      [userId]
    )

    if (!userResult) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
    }
    
    // Generate code if not exists (lazy generation)
    if (!userResult.referral_code) {
      const newCode = `AS-${userId}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      await db.updateOne('users', parseInt(userId, 10), { referral_code: newCode })
      userResult.referral_code = newCode
    }

    // 2. Get referred users count
    const referrals = await db.queryMany(`
      SELECT ur.*, u.name as referred_name 
      FROM user_referrals ur
      JOIN users u ON ur.referred_id = u.id
      WHERE ur.referrer_id = $1 
      ORDER BY ur.created_at DESC
    `, [userId])

    // 3. Get Ranking (Top 10 referrers)
    const ranking = await db.queryMany(`
      SELECT u.id, u.name, COUNT(r.id) as referral_count, SUM(r.points_awarded) as total_points
      FROM users u
      LEFT JOIN user_referrals r ON u.id = r.referrer_id
      GROUP BY u.id, u.name
      HAVING COUNT(r.id) > 0
      ORDER BY referral_count DESC, total_points DESC
      LIMIT 10
    `)

    return NextResponse.json({
      success: true,
      data: {
        user: {
          ...userResult,
          referrals_count: referrals.length,
          referrals: referrals
        },
        ranking
      }
    })
  } catch (error) {
    console.error('Error in referrals API:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}

// POST for points to wallet conversion
export async function POST(request: Request) {
  try {
    const { user_id, action, points_to_convert } = await request.json()

    if (!user_id || action !== 'convert_points' || !points_to_convert) {
      return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
    }

    if (points_to_convert % 1000 !== 0) {
      return NextResponse.json({ success: false, error: 'Points must be in multiples of 1000' }, { status: 400 })
    }

    const conversionRate = 10 / 1000; // 1000 points = $10 MXN
    const amountToAdd = points_to_convert * conversionRate;

    const result = await db.transaction(async (client) => {
      // Get user
      const userRes = await client.query('SELECT member_points, wallet_balance FROM users WHERE id = $1 FOR UPDATE', [user_id])
      const user = userRes.rows[0]

      if (!user || user.member_points < points_to_convert) {
        throw new Error('Insufficient points')
      }

      // Deduct points and add to wallet
      const newPoints = user.member_points - points_to_convert
      const newWallet = parseFloat(user.wallet_balance || '0') + amountToAdd

      await client.query(
        'UPDATE users SET member_points = $1, wallet_balance = $2 WHERE id = $3',
        [newPoints, newWallet, user_id]
      )

      // Add transaction record
      await client.query(
        'INSERT INTO reward_transactions (user_id, type, points, amount, description) VALUES ($1, $2, $3, $4, $5)',
        [user_id, 'point_conversion', -points_to_convert, amountToAdd, 'Convert points to wallet']
      )

      return { newPoints, newWallet }
    })

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('Error converting points:', error)
    return NextResponse.json({ success: false, error: error.message || 'Server error' }, { status: 500 })
  }
}
