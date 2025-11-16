
'use server';

/**
 * @fileOverview Extracts structured metadata from a research paper.
 *
 * - extractPaperMetadata - A function that handles the metadata extraction process.
 * - ExtractPaperMetadataInput - The input type for the extractPaperMetadata function.
 * - ExtractPaperMetadataOutput - The return type for the extractPaperMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractPaperMetadataInputSchema = z.object({
  text: z.string().describe('The full text of the research paper.'),
});
export type ExtractPaperMetadataInput = z.infer<typeof ExtractPaperMetadataInputSchema>;

const ExtractPaperMetadataOutputSchema = z.object({
  authors: z.array(z.string()).describe('A list of authors of the paper. For example, ["Azhar Ushmani"]').optional(),
  year: z.string().describe('The year the paper was published. For example, "2019"').optional(),
  field: z.string().describe('The general academic field of the paper. For example, "Cyber Security"').optional(),
});
export type ExtractPaperMetadataOutput = z.infer<typeof ExtractPaperMetadataOutputSchema>;

export async function extractPaperMetadata(
  input: ExtractPaperMetadataInput
): Promise<ExtractPaperMetadataOutput> {
  return extractPaperMetadataFlow(input);
}


const prompt = ai.definePrompt({
  name: 'extractPaperMetadataPrompt',
  input: {schema: ExtractPaperMetadataInputSchema},
  output: {schema: ExtractPaperMetadataOutputSchema},
  prompt: `You are a metadata extraction expert. Analyze the following text from a research paper and extract the following information:
1.  A list of all authors.
2.  The year the paper was published.
3.  The general field of study (e.g., Computer Science, Biology, etc.).

If any piece of information is not present, do not include the key in the output.

Paper Text:
{{{text}}}
  `,
});

const extractPaperMetadataFlow = ai.defineFlow(
  {
    name: 'extractPaperMetadataFlow',
    inputSchema: ExtractPaperMetadataInputSchema,
    outputSchema: ExtractPaperMetadataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
