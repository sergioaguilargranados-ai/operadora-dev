import { config } from 'dotenv';
config({ path: '.env.local' });
import { DestinationContentService } from './src/services/DestinationContentService';

async function run() {
  try {
    console.log("Generating for Madrid, España...");
    const content = await DestinationContentService.getContentForCity("Madrid", "España");
    console.log("Success!");
  } catch (error: any) {
    console.error("ERROR CAUGHT:");
    console.error(error.message);
  }
}

run();
