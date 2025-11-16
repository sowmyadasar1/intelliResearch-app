
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Upload, FileText, MessageSquare, Lightbulb, History, Sparkles } from "lucide-react";
import { UploadDialog } from "@/components/document/upload-dialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState, useMemo } from "react";
import { useDocumentContext } from "@/context/document-context";
import { useChatHistory } from "@/context/chat-history-context";
import { useSummaryHistory } from "@/context/summary-history-context";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";

type ActivityItem = {
  type: 'upload' | 'summary' | 'chat';
  description: string;
  timestamp: Date;
  documentId?: string;
  documentTitle?: string;
};

function SuggestedQuestions() {
    const questions = [
        "How can Transformer models be adapted for time-series forecasting?",
        "What are the primary failure modes of Generative Adversarial Networks?",
        "Compare the performance of CNNs and Vision Transformers on image segmentation tasks.",
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Lightbulb className="mr-2 text-primary" />
                    Suggested Research Questions
                </CardTitle>
                <CardDescription>Click a question to start your analysis.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-3">
                    {questions.map((q, i) => (
                        <li key={i}>
                          <Link href={`/literature-review?topic=${encodeURIComponent(q)}`} className="flex items-start gap-3 group">
                              <div className="mt-1">
                                  <Lightbulb className="h-4 w-4 text-amber-400" />
                              </div>
                              <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{q}</p>
                          </Link>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [welcomeMessage, setWelcomeMessage] = useState("Welcome to intelliResearch!");
  
  const { documents, loading: docsLoading } = useDocumentContext();
  const { messages, loading: chatLoading } = useChatHistory();
  const { summaries, loading: summaryLoading } = useSummaryHistory();

  useEffect(() => {
    if (user) {
      const firstName = user.displayName?.split(' ')[0] || 'Researcher';
      const creationTime = user.metadata.creationTime ? new Date(user.metadata.creationTime).getTime() : 0;
      const lastSignInTime = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).getTime() : 0;
      
      if (lastSignInTime && creationTime && (lastSignInTime - creationTime < 5000)) { 
          setWelcomeMessage(`Welcome, ${firstName}!`);
      } else {
          setWelcomeMessage(`Welcome back, ${firstName}!`);
      }
    } else {
      setWelcomeMessage("Welcome to intelliResearch!");
    }
  }, [user]);

  const recentDocuments = useMemo(() => {
    return documents.slice(0, 5);
  }, [documents]);

  const activityFeed = useMemo(() => {
    const docMap = new Map(documents.map(d => [d.id, d.title]));

    const uploadActivities: ActivityItem[] = documents.map(doc => ({
      type: 'upload',
      description: `Uploaded document "${doc.title}"`,
      timestamp: doc.uploadedAt?.toDate(),
      documentId: doc.id,
      documentTitle: doc.title,
    }));

    const summaryActivities: ActivityItem[] = summaries.map(summary => {
      // The summary's path is like: users/{uid}/documents/{docId}/summaries/{summaryId}
      const pathParts = summary.ref.path.split('/');
      const documentId = pathParts[3];
      const docTitle = docMap.get(documentId);
      return {
        type: 'summary',
        description: `Generated a ${summary.format} summary for "${docTitle || 'a document'}"`,
        timestamp: summary.createdAt?.toDate(),
        documentId,
        documentTitle: docTitle,
      };
    });

    const chatActivities: ActivityItem[] = messages
      .filter(msg => msg.role === 'user')
      .map(msg => {
        const pathParts = msg.ref.path.split('/');
        const documentId = pathParts[3];
        const docTitle = docMap.get(documentId);
        return {
          type: 'chat',
          description: `Asked a question about "${docTitle || 'a document'}"`,
          timestamp: msg.createdAt?.toDate(),
          documentId,
          documentTitle: docTitle,
        };
      });

      return [...uploadActivities, ...summaryActivities, ...chatActivities]
        .filter(item => item.timestamp)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10);

  }, [documents, summaries, messages]);
  
  const getIcon = (type: ActivityItem['type']) => {
    switch(type) {
        case 'upload': return <FileText className="h-4 w-4" />;
        case 'summary': return <MessageSquare className="h-4 w-4" />;
        case 'chat': return <MessageSquare className="h-4 w-4" />;
        default: return <History className="h-4 w-4" />;
    }
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
              <h1 className="text-3xl font-bold tracking-tight font-headline">{welcomeMessage}</h1>
              <p className="text-muted-foreground">Your intelligent academic companion.</p>
          </div>
          <UploadDialog>
              <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
              </Button>
          </UploadDialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>Jump back into your work.</CardDescription>
            </CardHeader>
            <CardContent>
                {docsLoading ? <p>Loading documents...</p> : recentDocuments.length > 0 ? (
                     <ul className="space-y-4">
                        {recentDocuments.map(doc => (
                           <li key={doc.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                                    <div>
                                        <Link href={`/documents/${doc.id}`} className="font-medium hover:underline">{doc.title}</Link>
                                        <p className="text-sm text-muted-foreground">Uploaded on {doc.uploadedAt ? format(doc.uploadedAt.toDate(), "PPP") : 'date unknown'}</p>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href={`/documents/${doc.id}`}>View</Link>
                                </Button>
                           </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No documents uploaded yet.</p>
                )}
            </CardContent>
          </Card>
          
          <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Sparkles className="mr-2 text-primary" />
                        Advanced Research Tools
                    </CardTitle>
                    <CardDescription>Supercharge your research process.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Analyze literature, identify research gaps, and critique arguments with our powerful AI assistant.</p>
                    <Button asChild>
                        <Link href="/literature-review">
                            Go to AI Assistant
                        </Link>
                    </Button>
                </CardContent>
            </Card>

            <SuggestedQuestions />
          </div>


          <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>A log of your recent interactions with the application.</CardDescription>
            </CardHeader>
            <CardContent>
                {docsLoading || chatLoading || summaryLoading ? <p>Loading activity...</p> : activityFeed.length > 0 ? (
                    <ul className="space-y-4">
                        {activityFeed.map((activity, index) => (
                            <li key={index} className="flex items-start gap-4">
                                <div className="p-2 bg-secondary rounded-full mt-1">
                                    {getIcon(activity.type)}
                                </div>
                                <div>
                                    <p className="text-sm">{activity.description}</p>
                                    <p className="text-xs text-muted-foreground">{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">No activity to show yet.</p>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}