import { pool } from './db'

/**
 * Checks if a cron job should run based on settings.
 * Returns true if the cron is active AND the current hour matches the scheduled hour,
 * OR if the 'force' flag is passed (e.g. from a manual button click).
 */
export async function shouldRunCron(cronKey: string, force: boolean = false): Promise<boolean> {
  if (force) return true;

  try {
    const result = await pool.query('SELECT is_active, scheduled_hour FROM cron_settings WHERE cron_key = $1', [cronKey]);
    
    if (result.rows.length === 0) {
      // If setting doesn't exist, allow it to run (fail-safe) or we could default to false.
      // Let's default to true for backward compatibility if the row is missing.
      return true;
    }

    const { is_active, scheduled_hour } = result.rows[0];

    if (!is_active) {
      console.log(`Cron [${cronKey}] abortado: Está desactivado en la configuración.`);
      return false;
    }

    if (scheduled_hour) {
      // Check if current server hour in Mexico time matches scheduled hour
      // Using UTC-6 for Mexico Time (simplified)
      const now = new Date();
      
      // Obtenemos la hora actual en la zona horaria America/Mexico_City
      const mxTimeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Mexico_City',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
      
      const currentMxTime = mxTimeFormatter.format(now); // "15:30"
      const currentHourStr = currentMxTime.split(':')[0]; // "15"
      const scheduledHourStr = scheduled_hour.split(':')[0]; // "03"

      if (currentHourStr !== scheduledHourStr) {
         console.log(`Cron [${cronKey}] abortado: Hora actual (${currentHourStr}) no coincide con la programada (${scheduledHourStr}).`);
         return false;
      }
    }

    // Update last_run
    await pool.query('UPDATE cron_settings SET last_run = NOW() WHERE cron_key = $1', [cronKey]);
    
    return true;
  } catch (error) {
    console.error(`Error checking cron settings for ${cronKey}:`, error);
    // On error, let it run to avoid silent failures of critical systems, or block it. 
    // We will block it to be safe.
    return false;
  }
}

/**
 * Inicia el registro de una ejecución de cron en la bitácora.
 * Retorna el ID del log creado para actualizarlo al finalizar.
 */
export async function startCronLog(cronKey: string): Promise<number | null> {
  try {
    const result = await pool.query(
      `INSERT INTO cron_logs (cron_key, status) VALUES ($1, 'running') RETURNING id`,
      [cronKey]
    );
    return result.rows[0].id;
  } catch (error) {
    console.error(`Error starting cron log for ${cronKey}:`, error);
    return null;
  }
}

/**
 * Finaliza el registro de una ejecución de cron en la bitácora.
 */
export async function finishCronLog(logId: number | null, status: 'success' | 'error', message: string = '', details: any = null): Promise<void> {
  if (!logId) return;
  try {
    const query = `
      UPDATE cron_logs 
      SET 
        completed_at = CURRENT_TIMESTAMP, 
        status = $1, 
        message = $2, 
        details = $3,
        duration_seconds = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - started_at))
      WHERE id = $4
    `;
    await pool.query(query, [status, message, details ? JSON.stringify(details) : null, logId]);
  } catch (error) {
    console.error(`Error finishing cron log ${logId}:`, error);
  }
}
