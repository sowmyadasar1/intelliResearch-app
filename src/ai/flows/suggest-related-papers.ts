'use server';

/**
 * @fileOverview Suggests related papers and identifies gaps in existing research based on a given topic.
 *
 * - suggestRelatedPapers - A function that suggests related papers and research gaps.
 * - SuggestRelatedPapersInput - The input type for the suggestRelatedPapers function.
 * - SuggestRelatedPapersOutput - The return type for the suggestRelatedPapers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRelatedPapersInputSchema = z.object({
  topic: z.string().describe('The research topic to find related papers and gaps for.'),
});
export type SuggestRelatedPapersInput = z.infer<typeof SuggestRelatedPapersInputSchema>;

const SuggestRelatedPapersOutputSchema = z.object({
  relatedPapers: z.array(z.object({
    title: z.string().describe('The title of the research paper.'),
    url: z.string().describe('A public URL to access the paper.'),
  })).describe('A list of related research papers with links.'),
  researchGaps: z.string().describe('Identified gaps in existing research.'),
  suggestedSubtopics: z.array(z.string()).describe('Suggested subtopics for further research.'),
  summaryOfTrends: z.string().describe('A summary of trends in the research area.'),
  recommendationsForFutureReading: z
    .string()
    .describe('Recommendations for future reading on the topic.'),
});
export type SuggestRelatedPapersOutput = z.infer<typeof SuggestRelatedPapersOutputSchema>;

export async function suggestRelatedPapers(
  input: SuggestRelatedPapersInput
): Promise<SuggestRelatedPapersOutput> {
  return suggestRelatedPapersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRelatedPapersPrompt',
  input: {schema: SuggestRelatedPapersInputSchema},
  output: {schema: SuggestRelatedPapersOutputSchema},
  prompt: `You are an expert research assistant. Your goal is to provide helpful information for researchers, guiding them in literature reviews.

  Based on the topic provided, suggest related papers (including public URLs if available), identify gaps in existing research, suggest subtopics, summarize trends, and provide recommendations for future reading. Ensure the URLs are fully-qualified and clickable.

  Topic: {{{topic}}}
  `,
});

const suggestRelatedPapersFlow = ai.defineFlow(
  {
    name: 'suggestRelatedPapersFlow',
    inputSchema: SuggestRelatedPapersInputSchema,
    outputSchema: SuggestRelatedPapersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
