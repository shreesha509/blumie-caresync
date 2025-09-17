
import * as dotenv from 'dotenv';
import * as path from 'path';
// Forcefully load the .env file from the root directory.
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
