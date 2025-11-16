'use server';

/**
 * @fileOverview Critiques a research argument using AI.
 *
 * - critiqueArgument - A function that handles the argument critique process.
 * - CritiqueArgumentInput - The input type for the critiqueArgument function.
 * - CritiqueArgumentOutput - The return type for the critiqueArgument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CritiqueArgumentInputSchema = z.object({
  topic: z.string().describe('The broader research topic.'),
  thesis: z.string().describe('The specific thesis statement or argument to be critiqued.'),
});
export type CritiqueArgumentInput = z.infer<typeof CritiqueArgumentInputSchema>;

const CritiqueArgumentOutputSchema = z.object({
  strengths: z.array(z.string()).describe('A list of strengths of the argument.'),
  weaknesses: z.array(z.string()).describe('A list of potential weaknesses or flaws in the argument.'),
  counterArguments: z.array(z.string()).describe('Potential counter-arguments to consider.'),
  suggestedImprovements: z.array(z.string()).describe('Suggestions for improving the thesis or argument.'),
  supportingPapers: z.array(z.object({
    title: z.string().describe('The title of the supporting research paper.'),
    url: z.string().describe('A public URL to access the paper.'),
  })).describe('A list of research papers that may support the argument.'),
});
export type CritiqueArgumentOutput = z.infer<typeof CritiqueArgumentOutputSchema>;


export async function critiqueArgument(
  input: CritiqueArgumentInput
): Promise<CritiqueArgumentOutput> {
  return critiqueArgumentFlow(input);
}


const prompt = ai.definePrompt({
  name: 'critiqueArgumentPrompt',
  input: {schema: CritiqueArgumentInputSchema},
  output: {schema: CritiqueArgumentOutputSchema},
  prompt: `You are an expert academic reviewer and research methodologist. Your goal is to provide a rigorous and constructive critique of a user's research argument.

  Research Topic: {{{topic}}}
  Thesis Statement / Argument:
  "{{{thesis}}}"

  Based on the provided topic and thesis, please perform the following analysis:
  1.  **Strengths**: Identify the strong points of the argument. Is it clear? Is it specific? Does it seem original?
  2.  **Weaknesses**: Identify potential weaknesses, logical fallacies, or unstated assumptions. Is the scope too broad or too narrow?
  3.  **Counter-Arguments**: What are the most compelling counter-arguments or alternative viewpoints that the author should be prepared to address?
  4.  **Suggested Improvements**: Offer concrete suggestions for how the thesis statement could be refined or strengthened.
  5.  **Supporting Papers**: Suggest 3-4 academic papers that could be relevant for supporting or contextualizing this argument. Provide their titles and public URLs.

  Provide a comprehensive and critical analysis.
  `,
});

const critiqueArgumentFlow = ai.defineFlow(
  {
    name: 'critiqueArgumentFlow',
    inputSchema: CritiqueArgumentInputSchema,
    outputSchema: CritiqueArgumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
