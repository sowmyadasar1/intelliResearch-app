
'use server';

/**
 * @fileOverview Implements the AI Chat with PDF functionality.
 *
 * - aiChatWithPdf - A function that handles the chat with PDF process.
 * - AIChatWithPdfInput - The input type for the aiChatWithPdf function.
 * - AIChatWithPdfOutput - The return type for the aiChatWithPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatWithPdfInputSchema = z.object({
  question: z.string().describe('The question about the PDF document.'),
  pdfTextChunks: z.array(z.string()).describe('The relevant text chunks from the PDF document.'),
});
export type AIChatWithPdfInput = z.infer<typeof AIChatWithPdfInputSchema>;

const AIChatWithPdfOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
  citations: z.array(z.object({
    pageNumber: z.number().describe('The page number where the cited text is found.'),
    paragraph: z.string().describe('The cited paragraph from the PDF.'),
  })).describe('The citations for the answer.'),
});
export type AIChatWithPdfOutput = z.infer<typeof AIChatWithPdfOutputSchema>;

export async function aiChatWithPdf(input: AIChatWithPdfInput): Promise<AIChatWithPdfOutput> {
  return aiChatWithPdfFlow(input);
}

const answerPrompt = ai.definePrompt({
  name: 'aiChatWithPdfAnswerPrompt',
  input: {schema: z.object({
    question: z.string(),
    context: z.string(),
  })},
  output: {schema: z.object({answer: z.string()})},
  prompt: `You are an AI research assistant. Answer the user's question based ONLY on the provided document context. Do not add any information that is not in the context.

Context:
{{{context}}}

Question: {{{question}}}

Answer:`,
});

const citationPrompt = ai.definePrompt({
  name: 'aiChatWithPdfCitationPrompt',
  input: { schema: z.object({
    answer: z.string(),
    context: z.string(),
  })},
  output: { schema: z.object({
    citations: z.array(z.object({
      pageNumber: z.number(),
      paragraph: z.string(),
    }))
  })},
  prompt: `You are a citation generation expert. Given the answer and the original document context, find the paragraphs and their page numbers from the context that were used to create the answer.

  Context:
  {{{context}}}

  Answer:
  "{{{answer}}}"

  Find the source paragraphs and page numbers for the answer above.
  `,
});

const aiChatWithPdfFlow = ai.defineFlow(
  {
    name: 'aiChatWithPdfFlow',
    inputSchema: AIChatWithPdfInputSchema,
    outputSchema: AIChatWithPdfOutputSchema,
  },
  async ({question, pdfTextChunks}) => {
    const context = pdfTextChunks
      .map((chunk, index) => `Page ${index + 1}:\n${chunk}`)
      .join('\n\n---\n\n');

    const { output: answerOutput } = await answerPrompt({ question, context });
    if (!answerOutput?.answer) {
      return {
        answer: "I'm sorry, I couldn't generate an answer based on the document.",
        citations: [],
      };
    }
    
    const { output: citationOutput } = await citationPrompt({ answer: answerOutput.answer, context });

    return {
      answer: answerOutput.answer,
      citations: citationOutput?.citations ?? [],
    };
  }
);
