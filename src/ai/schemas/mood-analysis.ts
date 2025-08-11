/**
 * @fileOverview Schemas for the mood analysis flow.
 *
 * - MoodAnalysisInput - The input type for the analyzeMood function.
 * - MoodAnalysisOutput - The return type for the analyzeMood function.
 * - MoodAnalysisInputSchema - The Zod schema for the input.
 * - MoodAnalysisOutputSchema - The Zod schema for the output.
 */

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
