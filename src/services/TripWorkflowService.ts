import { pool } from '@/lib/db';
import { CustomItineraryService } from './CustomItineraryService';
import { MegaTravelScrapingService } from './MegaTravelScrapingService';

export class TripWorkflowService {
  /**
   * Orchestrates the creation of an itinerary for a booking.
   * If it's a MegaTravel package, it clones the MT itinerary into the generic `itineraries` table.
   * Otherwise, it generates a new generic/AI itinerary using `CustomItineraryService`.
   */
  static async executePostBookingWorkflow(bookingId: number): Promise<void> {
    const client = await pool.connect();
    try {
      // 1. Get the booking
      const res = await client.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
      if (res.rows.length === 0) {
        console.error(`TripWorkflowService: Booking ${bookingId} not found`);
        return;
      }
      const booking = res.rows[0];

      // 2. Parse special_requests to get details
      let details: any = {};
      try {
        details = typeof booking.special_requests === 'string' 
          ? JSON.parse(booking.special_requests) 
          : (booking.special_requests || {});
      } catch (e) {
        console.warn(`TripWorkflowService: Could not parse special_requests for booking ${bookingId}`);
      }

      // 3. Determine if it's a MegaTravel tour
      // A booking is from MT if the details explicitly state the source or if the tour ID matches a MT tour.
      // Usually, when booking a MT tour, details.id is the package id.
      let isMegaTravel = false;
      let mtPackageId = null;

      if (booking.booking_type === 'tour') {
        // If it's a tour, check if the ID corresponds to a megatravel_packages entry
        const packageId = details?.id || details?.packageId;
        if (packageId) {
          const mtRes = await client.query('SELECT id FROM megatravel_packages WHERE id = $1', [packageId]);
          if (mtRes.rows.length > 0) {
            isMegaTravel = true;
            mtPackageId = mtRes.rows[0].id;
          }
        } else if (booking.destination?.toLowerCase().includes('megatravel')) {
           isMegaTravel = true;
        }
      }

      // 4. Branch the workflow
      if (isMegaTravel && mtPackageId) {
        console.log(`TripWorkflowService: Processing MegaTravel booking ${bookingId} for package ${mtPackageId}`);
        await this.processMegaTravelBooking(bookingId, mtPackageId, client, booking, details);
      } else {
        console.log(`TripWorkflowService: Processing Generic/AI booking ${bookingId}`);
        await CustomItineraryService.generateItineraryForBooking(bookingId);
      }
    } catch (error) {
      console.error(`TripWorkflowService: Error executing workflow for booking ${bookingId}:`, error);
    } finally {
      client.release();
    }
  }

  /**
   * Clones a MegaTravel package's itinerary into the unified `itineraries` table for a specific booking.
   */
  private static async processMegaTravelBooking(bookingId: number, mtPackageId: number, client: any, booking: any, details: any) {
    try {
      await client.query('BEGIN');

      // 1. Get the MT package and its days
      const pkgRes = await client.query('SELECT name, destination_name FROM megatravel_packages WHERE id = $1', [mtPackageId]);
      if (pkgRes.rows.length === 0) throw new Error('MT Package not found');
      const pkg = pkgRes.rows[0];

      const daysRes = await client.query('SELECT * FROM megatravel_itinerary WHERE package_id = $1 ORDER BY day_number ASC', [mtPackageId]);
      const mtDays = daysRes.rows;

      // 2. Format the days to match the generic JSONB structure
      const formattedDays = mtDays.map(d => ({
        day_number: d.day_number,
        title: d.title,
        description: d.description,
        meals: d.meals || '',
        hotel: d.hotel || '',
        city: d.location || '',
        activities: [],
        highlights: [],
        optional_activities: [],
        foods: [],
        places: [],
        souvenirs: [],
        phrases: [],
        practical_info: {}
      }));

      // 3. Clear existing itinerary for this booking (if any)
      await client.query('DELETE FROM itineraries WHERE booking_id = $1', [bookingId]);

      // 4. Determine dates
      let startDateStr = details?.fecha_inicio || null;
      let endDateStr = details?.fecha_fin || null;

      // 5. Insert into itineraries
      await client.query(`
        INSERT INTO itineraries (booking_id, user_id, title, description, destination, start_date, end_date, days)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        bookingId, 
        booking.user_id, 
        pkg.name, 
        `Itinerario MegaTravel para la reserva ${booking.booking_reference}`, 
        pkg.destination_name || booking.destination, 
        startDateStr, 
        endDateStr, 
        JSON.stringify(formattedDays)
      ]);

      await client.query('COMMIT');
      console.log(`TripWorkflowService: Cloned MT itinerary for booking ${bookingId}`);
      
      // Future Enhancement: Call a function here to enrich the empty `foods`, `places`, etc. using AI if desired.
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  }
}
