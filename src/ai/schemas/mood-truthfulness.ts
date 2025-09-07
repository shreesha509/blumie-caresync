
/**
 * @fileOverview Schemas for the mood truthfulness analysis flow.
 *
 * - MoodTruthfulnessInput - The input type for the analyzeMoodTruthfulness function.
 * - MoodTruthfulnessOutput - The return type for the analyzeMoodTruthfulness function.
 * - MoodTruthfulnessInputSchema - The Zod schema for the input.
 * - MoodTruthfulnessOutputSchema - The Zod schema for the output.
 */

import {z} from 'genkit';

const AnswersSchema = z.object({
    answer1: z.string(),
    answer2: z.string(),
    answer3: z.string(),
    answer4: z.string(),
    answer5: z.string(),
    answer6: z.string(),
    answer7: z.string(),
    answer8: z.string(),
    answer9: z.string(),
    answer10: z.string(),
});

export const MoodTruthfulnessInputSchema = z.object({
  studentName: z.string().describe("The name of the student submitting the answers."),
  mood: z.string().describe("The original mood description provided by the student."),
  answers: AnswersSchema.describe("The student's answers to the 10-question game."),
});
export type MoodTruthfulnessInput = z.infer<typeof MoodTruthfulnessInputSchema>;

export const MoodTruthfulnessOutputSchema = z.object({
  truthfulness: z
    .enum(["Genuine", "Potentially Inconsistent"])
    .describe('An assessment of whether the student\'s mood entry is real or potentially fake, based on their game answers.'),
  reasoning: z
    .string()
    .describe('A concise, one or two-sentence explanation for the truthfulness assessment.'),
  alertCaretaker: z
    .boolean()
    .describe("Set to true if the student's answers indicate a high-risk situation requiring immediate intervention, otherwise false."),
  recommendation: z
    .string()
    .describe("Based on the complete analysis, provide a concise, actionable recommendation for the warden. This should be a suggested next step, such as 'Recommend a casual check-in to discuss schoolwork stress,' 'Suggest monitoring social interactions,' or 'Advise scheduling a session with the school counselor for follow-up.' If no action is needed, state 'No immediate action recommended, continue normal observation.'"),
});
export type MoodTruthfulnessOutput = z.infer<typeof MoodTruthfulnessOutputSchema>;
