
/**
 * @fileOverview Schemas for the student chatbot flow.
 *
 * - StudentChatInput - The input type for the studentChat function.
 * - StudentChatOutput - The return type for the studentChat function.
 * - StudentChatInputSchema - The Zod schema for the input.
 * - StudentChatOutputSchema - The Zod schema for the output.
 */

import {z} from 'genkit';

const ChatHistorySchema = z.array(z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
}));

export const StudentChatInputSchema = z.object({
  mood: z.string().describe('The initial mood description provided by the student.'),
  chatHistory: ChatHistorySchema.describe('The history of the conversation so far.'),
});
export type StudentChatInput = z.infer<typeof StudentChatInputSchema>;

export const StudentChatOutputSchema = z.object({
  response: z
    .string()
    .describe('The chatbot\'s next conversational response to the student.'),
  isFinalMessage: z
    .boolean()
    .describe('Set to true when the conversation should conclude and the final message should be delivered.'),
  finalMessage: z
    .string()
    .describe('A concluding, supportive psychological message for the student based on their mood and the conversation. This is delivered at the end.')
});
export type StudentChatOutput = z.infer<typeof StudentChatOutputSchema>;
