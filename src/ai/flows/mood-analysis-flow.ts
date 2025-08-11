
'use server';
/**
 * @fileOverview A flow for analyzing student mood.
 *
 * - analyzeMood - Analyzes the provided mood text.
 * - MoodAnalysisInput - The input type for the analyzeMood function.
 * - MoodAnalysisOutput - The return type for the analyzeMood function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const MoodAnalysisInputSchema = z.object({
  mood: z.string().describe('The mood description provided by the student.'),
});
export type MoodAnalysisInput = z.infer<typeof MoodAnalysisInputSchema>;

export const MoodAnalysisOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise, one-sentence summary of the student\'s well-being based on their mood description. Frame it as an observation (e.g., "The student seems...").'),
});
export type MoodAnalysisOutput = z.infer<typeof MoodAnalysisOutputSchema>;

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
