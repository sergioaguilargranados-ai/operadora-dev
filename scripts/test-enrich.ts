require('dotenv').config({path:'.env.local'});
import { DestinationContentService } from '@/services/DestinationContentService';
import pool from '@/lib/db';

async function run() {
  try {
    const res = await DestinationContentService.enrichItineraryDays(5);
    console.log('Enrich success');
    // console.log(JSON.stringify(res.days, null, 2));
  } catch (error) {
    console.error(error);
  } finally {
    pool.end();
  }
}
run();
