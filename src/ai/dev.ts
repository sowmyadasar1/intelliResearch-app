
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-chat-with-pdf.ts';
import '@/ai/flows/critique-argument.ts';
import '@/ai/flows/generate-citations.ts';
import '@/ai/flows/generate-paper-summary.ts';
import '@/ai/flows/suggest-related-papers.ts';
import '@/ai/flows/extract-paper-metadata.ts';
