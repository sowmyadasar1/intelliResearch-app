
import { FileText, MessageSquare, BookOpen, Lightbulb } from 'lucide-react';

// This data is no longer the primary source of truth but can be used for fallbacks or examples.
export type Document = {
  id: string;
  title: string;
  uploadedAt: string; // Will be a Firestore Timestamp, but string for type consistency here.
};

export const recentDocuments: Document[] = [];

export const recentActivities: { id: number; type: string; description: string; timestamp: string; icon: React.ElementType }[] = [];

export const suggestedQuestions = [
    { id: 1, question: "How can Transformer models be adapted for time-series forecasting?" },
    { id: 2, question: "What are the primary failure modes of Generative Adversarial Networks?" },
    { id: 3, question: "Compare the performance of CNNs and Vision Transformers on image segmentation tasks." },
];

    