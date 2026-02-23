'use server';
/**
 * @fileOverview This file implements a Genkit flow for suggesting a mood tag
 * based on user confession text. It analyzes the sentiment of the text
 * and selects the most appropriate mood from a predefined list.
 *
 * - suggestMoodTagForConfession - A function that suggests a mood tag for a confession.
 * - SuggestMoodTagInput - The input type for the suggestMoodTagForConfession function.
 * - SuggestMoodTagOutput - The return type for the suggestMoodTagForConfession function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { MoodTags } from '@/lib/mood-tags';

const SuggestMoodTagInputSchema = z.object({
  confessionText: z.string().describe('The text of the user\'s confession.'),
});
export type SuggestMoodTagInput = z.infer<typeof SuggestMoodTagInputSchema>;

const SuggestMoodTagOutputSchema = z.object({
  moodTag: z.enum(MoodTags).describe('The suggested mood tag for the confession.'),
});
export type SuggestMoodTagOutput = z.infer<typeof SuggestMoodTagOutputSchema>;

export async function suggestMoodTagForConfession(input: SuggestMoodTagInput): Promise<SuggestMoodTagOutput> {
  return suggestMoodTagFlow(input);
}

const suggestMoodTagPrompt = ai.definePrompt({
  name: 'suggestMoodTagPrompt',
  input: { schema: SuggestMoodTagInputSchema },
  output: { schema: SuggestMoodTagOutputSchema },
  prompt: `You are an AI assistant specialized in sentiment analysis for personal confessions.
Your task is to read the provided confession text and identify the most relevant mood tag from the following options:

Available Mood Tags: ${MoodTags.map(tag => `'${tag}'`).join(', ')}

Confession Text: "{{{confessionText}}}"

Based on the confession, select only one mood tag that best describes its sentiment and return it in the specified JSON format.`, 
});

const suggestMoodTagFlow = ai.defineFlow(
  {
    name: 'suggestMoodTagFlow',
    inputSchema: SuggestMoodTagInputSchema,
    outputSchema: SuggestMoodTagOutputSchema,
  },
  async (input) => {
    const { output } = await suggestMoodTagPrompt(input);
    return output!;
  }
);
