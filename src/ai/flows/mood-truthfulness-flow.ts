
'use server';
/**
 * @fileOverview A flow for analyzing the truthfulness of a student's mood entry by comparing it with their game answers.
 *
 * - analyzeMoodTruthfulness - Analyzes the provided mood and game answers for consistency.
 */

import {ai} from '@/ai/genkit';
import {
  MoodTruthfulnessInput,
  MoodTruthfulnessInputSchema,
  MoodTruthfulnessOutput,
  MoodTruthfulnessOutputSchema
} from '@/ai/schemas/mood-truthfulness';
import { sendSmsWarning } from '@/services/notification-service';

export async function analyzeMoodTruthfulness(input: MoodTruthfulnessInput): Promise<MoodTruthfulnessOutput> {
  return moodTruthfulnessFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moodTruthfulnessPrompt',
  input: {schema: MoodTruthfulnessInputSchema},
  output: {schema: MoodTruthfulnessOutputSchema},
  prompt: `You are a school wellness counselor with a specialization in psychology. Your task is to analyze a student's self-reported mood and compare it against their answers to a 10-question psychological game to determine the likelihood that their initial mood description is genuine. More importantly, you must assess if the student's answers suggest they are in a dangerous state or require immediate intervention.

- Student's mood description: {{{mood}}}
- Student's game answers:
  1. "How do you feel about a surprise test?": {{{answers.answer1}}}
  2. "A friend cancels plans last minute. Your reaction?": {{{answers.answer2}}}
  3. "You have a free afternoon. What do you do?": {{{answers.answer3}}}
  4. "How often do you feel overwhelmed by your schoolwork?": {{{answers.answer4}}}
  5. "You receive unexpected praise. How do you feel?": {{{answers.answer5}}}
  6. "How easy is it for you to fall asleep at night?": {{{answers.answer6}}}
  7. "What is your energy level like right now?": {{{answers.answer7}}}
  8. "How connected do you feel to your friends and family?": {{{answers.answer8}}}
  9. "You made a mistake on an assignment. Your first thought?": {{{answers.answer9}}}
  10. "What are you most looking forward to?": {{{answers.answer10}}}

Analyze all inputs for patterns, congruencies, and contradictions.
- If the mood and answers are consistent, set truthfulness to "Genuine".
- If there are contradictions (e.g., reports feeling "Happy" but answers suggest high stress), set truthfulness to "Potentially Inconsistent".

CRITICAL ASSESSMENT:
- Review the answers for any indication of severe distress, hopelessness, isolation, self-harm ideation, or a dangerous situation (e.g., answers like "'I'm a failure.'", "Isolated", "Nothing in particular" to looking forward to something, "Non-existent" motivation).
- If you detect a combination of responses that indicate a high-risk situation that requires immediate intervention from a caretaker, set the 'alertCaretaker' flag to true. Otherwise, set it to false.

Provide a concise, one or two-sentence reasoning for your conclusion. Frame it as a professional observation.
`,
});

const moodTruthfulnessFlow = ai.defineFlow(
  {
    name: 'moodTruthfulnessFlow',
    inputSchema: MoodTruthfulnessInputSchema,
    outputSchema: MoodTruthfulnessOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    
    // If the AI flags the situation as requiring an alert, send the SMS.
    if (output?.alertCaretaker) {
      await sendSmsWarning(input.studentName);
    }
    
    return output!;
  }
);
