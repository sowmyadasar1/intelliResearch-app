'use server';

/**
 * @fileOverview Generates summaries of research papers in different formats.
 *
 * - generatePaperSummary - A function that generates a summary of a research paper.
 * - GeneratePaperSummaryInput - The input type for the generatePaperSummary function.
 * - GeneratePaperSummaryOutput - The return type for the generatePaperSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePaperSummaryInputSchema = z.object({
  text: z.string().describe('The text of the research paper to summarize.'),
  format: z
    .enum([
      'one-page',
      'detailed',
      'bullet-points-key-ideas',
      'limitations',
      'future-directions',
      'novel-contributions',
      'methods',
      'dataset-experiment',
    ])
    .describe('The desired format of the summary.'),
});
export type GeneratePaperSummaryInput = z.infer<
  typeof GeneratePaperSummaryInputSchema
>;

const GeneratePaperSummaryOutputSchema = z.object({
  summary: z.string().describe('The generated summary of the research paper.'),
});
export type GeneratePaperSummaryOutput = z.infer<
  typeof GeneratePaperSummaryOutputSchema
>;

export async function generatePaperSummary(
  input: GeneratePaperSummaryInput
): Promise<GeneratePaperSummaryOutput> {
  return generatePaperSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePaperSummaryPrompt',
  input: {schema: GeneratePaperSummaryInputSchema},
  output: {schema: GeneratePaperSummaryOutputSchema},
  prompt: `You are an expert in summarizing research papers.  You will generate a summary of the research paper in the format requested by the user.

Paper Text: {{{text}}}

Summary Format: {{{format}}}

Summary:
`,
});

const generatePaperSummaryFlow = ai.defineFlow(
  {
    name: 'generatePaperSummaryFlow',
    inputSchema: GeneratePaperSummaryInputSchema,
    outputSchema: GeneratePaperSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
