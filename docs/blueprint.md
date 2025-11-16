# **App Name**: ScholarAI

## Core Features:

- Secure User Authentication: Google Sign-in and Email/Password options with profile storage.
- PDF Upload and Text Extraction: Users upload PDFs, store them in Firebase Storage, and extract text to generate embeddings in Firestore.
- AI Chat with Document Retrieval: Users ask questions about uploaded papers; semantic search uses embeddings. The LLM provides answers and citations using a retrieval tool to augment its answer from the PDF content.
- Automatic Summarization: Generates various summaries for uploaded PDFs like a 1-page summary, key ideas, and novel contributions.
- Literature Review Tool: The app generates related papers, research gaps, and topic summaries from the user-provided research topics using an LLM-powered research tool.
- Citation Generation: Automatically extracts and formats citations (APA, MLA, etc.) using LLM structuring from parsed metadata.
- Personalized Dashboard: Displays user activity, uploaded PDFs, summaries, and suggested research questions. Offers time-spent analytics and query stats.

## Style Guidelines:

- Primary color: Soft blue (#A0C4FF) for a calm and scholarly feel.
- Background color: Very light blue (#F0F8FF), almost white, maintaining the calming and scholarly feel.
- Accent color: Muted lavender (#BDB2FF) to add a touch of sophistication without overwhelming.
- Body and headline font: 'Literata', a serif font that gives a vintage, scholarly and literary impression.
- Use clean, minimalist icons for PDFs, the AI bot, summaries, and citations.
- Design a minimalistic layout with soft colors that evokes an academic vibe, ensuring mobile responsiveness.
- Subtle animations when generating summaries or new research suggestions.