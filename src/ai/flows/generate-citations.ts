// src/ai/flows/generate-citations.ts
'use server';

/**
 * @fileOverview Automatically generates citations in various formats from uploaded papers.
 *
 * - generateCitations - A function that handles the citation generation process.
 * - GenerateCitationsInput - The input type for the generateCitations function.
 * - GenerateCitationsOutput - The return type for the generateCitations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCitationsInputSchema = z.object({
  text: z.string().describe('The text from which to generate citations.'),
  format: z
    .enum(['APA', 'MLA', 'Harvard', 'IEEE', 'Chicago'])
    .describe('The citation format to use.'),
});
export type GenerateCitationsInput = z.infer<typeof GenerateCitationsInputSchema>;

const GenerateCitationsOutputSchema = z.object({
  citations: z.string().describe('The generated citations in the specified format.'),
});
export type GenerateCitationsOutput = z.infer<typeof GenerateCitationsOutputSchema>;

export async function generateCitations(input: GenerateCitationsInput): Promise<GenerateCitationsOutput> {
  return generateCitationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateCitationsPrompt',
  input: {schema: GenerateCitationsInputSchema},
  output: {schema: GenerateCitationsOutputSchema},
  prompt: `You are an expert in generating academic citations. Given the following text and citation format, generate the citations in the specified format.\n\nText: {{{text}}}\nFormat: {{{format}}}\n\nCitations:`, // crucial trailing newline
});

const generateCitationsFlow = ai.defineFlow(
  {
    name: 'generateCitationsFlow',
    inputSchema: GenerateCitationsInputSchema,
    outputSchema: GenerateCitationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
