
'use server';
/**
 * @fileOverview A flow for analyzing student mood.
 *
 * - analyzeMood - Analyzes the provided mood text.
 */

import {ai} from '@/ai/genkit';
import {
  MoodAnalysisInput,
  MoodAnalysisInputSchema,
  MoodAnalysisOutput,
  MoodAnalysisOutputSchema
} from '@/ai/schemas/mood-analysis';

export async function analyzeMood(input: MoodAnalysisInput): Promise<MoodAnalysisOutput> {
  return analyzeMoodFlow(input);
}

const prompt = ai.definePrompt({
  name: 'moodAnalysisPrompt',
  input: {schema: MoodAnalysisInputSchema},
  output: {schema: MoodAnalysisOutputSchema},
  prompt: `You are a school wellness counselor. Your task is to analyze a student's mood description and provide a simple, one-sentence summary of their potential state of well-being. Do not offer advice.

Student's mood: {{{mood}}}`,
});

const analyzeMoodFlow = ai.defineFlow(
  {
    name: 'analyzeMoodFlow',
    inputSchema: MoodAnalysisInputSchema,
    outputSchema: MoodAnalysisOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
