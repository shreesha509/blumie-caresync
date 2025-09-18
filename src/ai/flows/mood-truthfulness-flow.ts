
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
  1. "You just found out a surprise test is happening in your next class. How do you feel?": {{{answers.answer1}}}
  2. "A friend cancels plans with you last minute. What's your immediate reaction?": {{{answers.answer2}}}
  3. "You have a completely free afternoon with no obligations. What are you most likely to do?": {{{answers.answer3}}}
  4. "How often have you felt overwhelmed by your schoolwork this past week?": {{{answers.answer4}}}
  5. "You receive some unexpected praise from a teacher. How does it make you feel?": {{{answers.answer5}}}
  6. "How easy has it been for you to fall asleep at night recently?": {{{answers.answer6}}}
  7. "Thinking about your energy levels right now, which best describes them?": {{{answers.answer7}}}
  8. "How connected do you feel to your friends and family at the moment?": {{{answers.answer8}}}
  9. "You make a mistake on an important assignment. What is your first thought?": {{{answers.answer9}}}
  10. "Right now, what are you most looking forward to?": {{{answers.answer10}}}

Analyze all inputs for patterns, congruencies, and contradictions.
- If the mood and answers are consistent, set truthfulness to "Genuine".
- If there are contradictions (e.g., reports feeling "Happy" but answers suggest high stress), set truthfulness to "Potentially Inconsistent".

CRITICAL ASSESSMENT:
- Review the answers for any indication of severe distress, hopelessness, isolation, self-harm ideation, or a dangerous situation (e.g., answers like "'I'm a failure.'", "Isolated", "Nothing in particular" to looking forward to something, "Non-existent" motivation).
- If you detect a combination of responses that indicate a high-risk situation that requires immediate intervention from a caretaker, set the 'alertCaretaker' flag to true. Otherwise, set it to false.

Provide a concise, one or two-sentence reasoning for your conclusion. Frame it as a professional observation.

Finally, provide a single, actionable recommendation for the warden based on the overall analysis.
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
      // This is an async operation, but we don't need to wait for it to complete
      // before returning the analysis to the app. It can run in the background.
      sendSmsWarning(input.studentName);
    }
    
    return output!;
  }
);
