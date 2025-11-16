
"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Sparkles, Copy, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseInstances } from "@/lib/firebase/client";
import { useAuth } from "@/hooks/use-auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useParams } from "next/navigation";
import { errorEmitter } from "@/lib/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/lib/firebase/errors";
import { generatePaperSummary } from "@/ai/flows/generate-paper-summary";

export const summaryTypes = [
  { value: 'one-page', label: '1-page Summary' },
  { value: 'detailed', label: 'Detailed Summary' },
  { value: 'bullet-points-key-ideas', label: 'Bullet-point Key Ideas' },
  { value: 'limitations', label: 'Limitations of the paper' },
  { value: 'future-directions', label: 'Future directions' },
  { value: 'novel-contributions', label: 'Novel contributions' },
  { value: 'methods', label: 'Methods summary' },
];

export function SummaryGenerator({ documentText }: { documentText: string }) {
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState<any>("one-page");
  const { toast } = useToast();
  const { user } = useAuth();
  const { firestore } = getFirebaseInstances();
  const params = useParams();
  const documentId = params.id as string;

  const handleGenerate = async () => {
    if (!documentText) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Document content is not available to generate a summary.",
        });
        return;
    }
    setIsLoading(true);
    setSummary("");

    // Log summary generation to Firestore
    if (user && documentId) {
      const summariesRef = collection(firestore, `users/${user.uid}/documents/${documentId}/summaries`);
      const summaryData = {
          format,
          createdAt: serverTimestamp()
      };
      addDoc(summariesRef, summaryData).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
              path: summariesRef.path,
              operation: 'create',
              requestResourceData: summaryData,
          } satisfies SecurityRuleContext);
          errorEmitter.emit('permission-error', permissionError);
      });
    }

    try {
        const result = await generatePaperSummary({ text: documentText, format });
        setSummary(result.summary);
    } catch(error) {
        console.error("Error generating summary:", error);
        toast({
            variant: "destructive",
            title: "AI Error",
            description: "Failed to generate summary.",
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    if (summary) {
        navigator.clipboard.writeText(summary);
        toast({
            title: "Copied to clipboard!",
            description: "The generated summary has been copied.",
        })
    }
  };

  const handleFeedback = () => {
    toast({
        title: "Feedback received!",
        description: "Thank you for helping us improve.",
    });
  };

  return (
    <div className="flex flex-col h-full p-4 pt-0">
      <div className="flex items-center gap-2 mb-4">
        <Select defaultValue={format} onValueChange={setFormat}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select summary type" />
          </SelectTrigger>
          <SelectContent>
            {summaryTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleGenerate} disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
          Generate
        </Button>
      </div>

      <Card className="flex-1">
        <CardContent className="p-4 h-full">
          <ScrollArea className="h-full pr-4">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[80%]" />
                <Skeleton className="h-4 w-full mt-4" />
                <Skeleton className="h-4 w-[90%]" />
              </div>
            ) : summary ? (
              <div>
                <p className="text-sm whitespace-pre-wrap">{summary}</p>
                <div className="flex items-center gap-2 mt-4">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopy}>
                        <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFeedback}>
                        <ThumbsUp className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleFeedback}>
                        <ThumbsDown className="h-4 w-4" />
                    </Button>
                </div>
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Sparkles className="h-10 w-10 mb-2" />
                    <p className="text-sm">Select a summary type and click 'Generate' to create a summary.</p>
                </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
