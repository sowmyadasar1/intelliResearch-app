
"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInterface } from "@/components/document/chat-interface";
import { SummaryGenerator } from "@/components/document/summary-generator";
import { CitationGenerator } from "@/components/document/citation-generator";
import { useAuth } from "@/hooks/use-auth";
import { getFirebaseInstances } from "@/lib/firebase/client";
import { doc, DocumentData } from "firebase/firestore";
import { useDocument } from 'react-firebase-hooks/firestore';
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NotesEditor } from "@/components/document/notes-editor";
import { generatePaperSummary } from "@/ai/flows/generate-paper-summary";
import { extractPaperMetadata, type ExtractPaperMetadataOutput } from "@/ai/flows/extract-paper-metadata";
import { Skeleton } from "@/components/ui/skeleton";

function MetadataDisplay({ content }: { content: string }) {
  const [metadata, setMetadata] = React.useState<Partial<ExtractPaperMetadataOutput>>({});
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (content) {
      setIsLoading(true);
      extractPaperMetadata({ text: content })
        .then(result => {
          setMetadata(result);
        })
        .catch(error => {
          console.error("Error extracting metadata:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [content]);

  const displayAuthors = (authors: string[] | undefined) => {
    if (!authors || authors.length === 0) return "Author et al.";
    if (authors.length === 1) return authors[0];
    return `${authors[0]} et al.`;
  };

  return (
    <div className="flex gap-2 text-sm text-muted-foreground">
      {isLoading ? (
        <>
          <Skeleton className="h-4 w-24" />
          <Separator orientation="vertical" className="h-auto" />
          <Skeleton className="h-4 w-12" />
          <Separator orientation="vertical" className="h-auto" />
          <Skeleton className="h-6 w-20" />
        </>
      ) : (
        <>
          <span>{displayAuthors(metadata.authors)}</span>
          <Separator orientation="vertical" className="h-auto" />
          <span>{metadata.year || "Year"}</span>
          <Separator orientation="vertical" className="h-auto" />
          {metadata.field ? (
            <Badge variant="outline">{metadata.field}</Badge>
          ) : (
            <Badge variant="outline">Field</Badge>
          )}
        </>
      )}
    </div>
  );
}


function AbstractDisplay({ content }: { content: string }) {
  const [summary, setSummary] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (content) {
      setIsLoading(true);
      generatePaperSummary({ text: content, format: 'one-page' })
        .then(result => {
          setSummary(result.summary);
        })
        .catch(error => {
          console.error("Error generating abstract:", error);
          setSummary("Could not generate an abstract for this document.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [content]);

  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-foreground whitespace-pre-wrap">
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[80%]" />
          <Skeleton className="h-4 w-full mt-4" />
          <Skeleton className="h-4 w-[90%]" />
        </div>
      ) : (
        <p>{summary}</p>
      )}
    </div>
  );
}

export default function DocumentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const { firestore } = getFirebaseInstances();

  const [document, docLoading, docError] = useDocument(
    user ? doc(firestore, "users", user.uid, "documents", id) : undefined
  );

  const documentData = document?.data();
  
  // Use the real content from Firestore for AI tools.
  const documentTextContent = documentData?.content || "";


  if (authLoading || docLoading) {
    // We can return null here because Next.js will show the loading.tsx file
    return null;
  }

  if (!documentData || docError) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h1 className="text-2xl font-bold">Document not found</h1>
            <p className="text-muted-foreground">{docError?.message || "The requested document does not exist or you don't have permission to view it."}</p>
            <Button asChild variant="link" className="mt-4">
                <Link href="/documents">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Documents
                </Link>
            </Button>
        </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Document Content */}
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>{documentData.title}</CardTitle>
                 <MetadataDisplay content={documentTextContent} />
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <AbstractDisplay content={documentTextContent} />
                </ScrollArea>
            </CardContent>
        </Card>
        
        {/* Right Column: AI Tools */}
        <Card className="flex flex-col h-full">
            <Tabs defaultValue="chat" className="flex flex-col h-full">
                <CardHeader>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="chat">Chat</TabsTrigger>
                        <TabsTrigger value="summary">Summaries</TabsTrigger>
                        <TabsTrigger value="citations">Citations</TabsTrigger>
                        <TabsTrigger value="notes">Notes</TabsTrigger>
                    </TabsList>
                </CardHeader>
                <TabsContent value="chat" className="flex-1 overflow-hidden mt-0">
                    <ChatInterface documentId={id} documentText={documentTextContent} />
                </TabsContent>
                <TabsContent value="summary" className="flex-1 overflow-hidden mt-0">
                    <SummaryGenerator documentText={documentTextContent} />
                </TabsContent>
                <TabsContent value="citations" className="flex-1 overflow-hidden mt-0">
                    <CitationGenerator documentText={documentTextContent} />
                </TabsContent>
                <TabsContent value="notes" className="flex-1 overflow-hidden mt-0">
                    <NotesEditor documentId={id} />
                </TabsContent>
            </Tabs>
        </Card>
    </div>
  );
}
