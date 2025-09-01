
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
  prompt: `You are a school wellness counselor with a specialization in psychology. Your task is to perform a psychological analysis of a student's mood description.

Analyze the student's word choice, sentiment, and underlying meaning. Provide a concise, one or two-sentence analysis of their potential psychological state. Frame it as a professional observation. Do not offer advice.

Student's mood description: {{{mood}}}`,
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
