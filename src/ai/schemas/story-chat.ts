
/**
 * @fileOverview Schemas for the post-game story chatbot flow.
 *
 * - StoryChatInput - The input type for the storyChat function.
 * - StoryChatOutput - The return type for the storyChat function.
 * - StoryChatInputSchema - The Zod schema for the input.
 * - StoryChatOutputSchema - The Zod schema for the output.
 */

import {z} from 'genkit';

const ChatHistorySchema = z.array(z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
}));

const GameAnswersSchema = z.object({
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

export const StoryChatInputSchema = z.object({
  mood: z.string().describe('The initial mood description provided by the student.'),
  gameAnswers: GameAnswersSchema.describe("The student's answers to the 10-question game."),
  chatHistory: ChatHistorySchema.describe('The history of the conversation so far.'),
});
export type StoryChatInput = z.infer<typeof StoryChatInputSchema>;

export const StoryChatOutputSchema = z.object({
  response: z
    .string()
    .describe('The chatbot\'s next conversational response to the student.'),
  isFinalMessage: z
    .boolean()
    .describe('Set to true when the conversation should conclude and the final message should be delivered. This typically happens after 1-2 user interactions.'),
  finalMessage: z
    .string()
    .describe('A concluding, supportive psychological message for the student based on their mood and the conversation. This is delivered only at the very end when isFinalMessage is true.')
});
export type StoryChatOutput = z.infer<typeof StoryChatOutputSchema>;
