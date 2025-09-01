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
  analysis: z
    .string()
    .describe('A concise, one or two-sentence psychological analysis of the student\'s well-being based on their mood description. Frame it as a professional observation (e.g., "The student\'s language suggests...").'),
});
export type MoodAnalysisOutput = z.infer<typeof MoodAnalysisOutputSchema>;
