import { query } from '@/lib/db'

export class StoreOrderService {
  /**
   * Procesa la confirmación de una orden de tienda (y referidos) cuando
   * su booking subyacente es marcado como pagado.
   */
  static async handleStoreOrderPayment(bookingId: number) {
    try {
      // 1. Obtener la reserva para ver si es tipo store_order y extraer store_order_id
      const bookingRes = await query(
        `SELECT id, booking_type, special_requests, total_price, user_id
         FROM bookings
         WHERE id = $1`,
        [bookingId]
      )

      if (bookingRes.rows.length === 0) return

      const booking = bookingRes.rows[0]

      if (booking.booking_type !== 'store_order') return

      // Extraer store_order_id de special_requests
      let storeOrderId: number | null = null
      try {
        const details = booking.special_requests ? JSON.parse(booking.special_requests) : {}
        storeOrderId = details.store_order_id
      } catch (e) {
        console.error('Error parseando special_requests para store_order', e)
      }

      if (!storeOrderId) return

      // 2. Marcar store_order como 'paid'
      await query(
        `UPDATE store_orders SET status = 'paid', updated_at = NOW() WHERE id = $1`,
        [storeOrderId]
      )

      console.log(`✅ Store Order #${storeOrderId} marcada como pagada.`)

      // 3. Lógica de Referidos (Otorgar puntos/dinero si el usuario fue referido)
      const userId = booking.user_id
      const totalAmount = parseFloat(booking.total_price) || 0

      const referralCheck = await query(
        `SELECT referrer_id FROM user_referrals WHERE referred_id = $1`,
        [userId]
      )

      if (referralCheck.rows.length > 0) {
        const referrerId = referralCheck.rows[0].referrer_id
        const pointsToAward = Math.floor(totalAmount)
        const walletToAdd = pointsToAward / 100 // 1000 puntos = 10 pesos

        // Actualizar wallet del referidor
        await query(
          `UPDATE users 
           SET member_points = COALESCE(member_points, 0) + $1,
               wallet_balance = COALESCE(wallet_balance, 0) + $2
           WHERE id = $3`,
          [pointsToAward, walletToAdd, referrerId]
        )

        // Registrar puntos otorgados en la relación
        await query(
          `UPDATE user_referrals 
           SET points_awarded = COALESCE(points_awarded, 0) + $1 
           WHERE referred_id = $2`,
          [pointsToAward, userId]
        )
        
        console.log(`🎁 Puntos de referidos otorgados: ${pointsToAward} al usuario ${referrerId}`)
      }
    } catch (error) {
      console.error('Error en handleStoreOrderPayment:', error)
    }
  }
}
