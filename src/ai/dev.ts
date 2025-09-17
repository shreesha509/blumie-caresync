
// Load environment variables from .env file before anything else
import 'dotenv/config';

// Flows will be imported for their side effects in this file.
import './flows/mood-analysis-flow';
import './flows/mood-consistency-flow';
import './flows/mood-truthfulness-flow';
import './flows/story-chat-flow';
