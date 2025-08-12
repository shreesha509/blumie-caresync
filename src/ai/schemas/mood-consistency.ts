
/**
 * @fileOverview Schemas for the mood consistency analysis flow.
 *
 * - MoodConsistencyInput - The input type for the analyzeMoodConsistency function.
 * - MoodConsistencyOutput - The return type for the analyzeMoodConsistency function.
 * - MoodConsistencyInputSchema - The Zod schema for the input.
 * - MoodConsistencyOutputSchema - The Zod schema for the output.
 */

import {z} from 'genkit';

export const MoodConsistencyInputSchema = z.object({
  mood: z.string().describe("The original mood description provided by the student."),
  gameResponse: z.string().describe("The student's reaction to the surprise test scenario (e.g., 'nervous', 'excited', 'anxious', 'indifferent')."),
});
export type MoodConsistencyInput = z.infer<typeof MoodConsistencyInputSchema>;

export const MoodConsistencyOutputSchema = z.object({
  summary: z
    .string()
    .describe('A concise, one-sentence summary of the student\'s well-being, considering both their mood and their game response. If there is a contradiction, mention it (e.g., "The student claims to be happy, but their anxious reaction to a surprise test suggests underlying stress."). Otherwise, confirm consistency (e.g., "The student seems genuinely calm, as their reaction to the scenario was measured.").'),
});
export type MoodConsistencyOutput = z.infer<typeof MoodConsistencyOutputSchema>;
