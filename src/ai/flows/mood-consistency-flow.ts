
'use server';
/**
 * @fileOverview A flow for analyzing the consistency between a student's mood and their game response.
 *
 * - analyzeMoodConsistency - Analyzes the provided mood and game response for consistency.
 */

import {ai} from '@/ai/genkit';
import {
  MoodConsistencyInput,
  MoodConsistencyInputSchema,
  MoodConsistencyOutput,
  MoodConsistencyOutputSchema
} from '@/ai/schemas/mood-consistency';

export async function analyzeMoodConsistency(input: MoodConsistencyInput): Promise<MoodConsistencyOutput> {
  return moodConsistencyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moodConsistencyPrompt',
  input: {schema: MoodConsistencyInputSchema},
  output: {schema: MoodConsistencyOutputSchema},
  prompt: `You are a school wellness counselor. Your task is to analyze a student's self-reported mood and compare it to their reaction to a hypothetical scenario to check for consistency.

- Student's mood description: {{{mood}}}
- Scenario: "You just found out a surprise test is happening in your next class. How do you feel?"
- Student's reaction: {{{gameResponse}}}

Analyze both inputs and provide a new, one-sentence summary.
- If the mood and reaction are consistent, confirm it.
- If they contradict, point out the inconsistency.
- Frame the summary as an observation (e.g., "The student appears..."). Do not offer advice.`,
});

const moodConsistencyFlow = ai.defineFlow(
  {
    name: 'moodConsistencyFlow',
    inputSchema: MoodConsistencyInputSchema,
    outputSchema: MoodConsistencyOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
