
"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Sparkles, Copy, Loader2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { generateCitations } from "@/ai/flows/generate-citations";

const citationFormats = [
  { value: 'APA', label: 'APA 7th Edition' },
  { value: 'MLA', label: 'MLA 9th Edition' },
  { value: 'Chicago', label: 'Chicago 17th Edition' },
  { value: 'Harvard', label: 'Harvard' },
  { value: 'IEEE', label: 'IEEE' },
];

export function CitationGenerator({ documentText }: { documentText: string }) {
  const [citation, setCitation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [format, setFormat] = useState<any>("APA");
  const { toast } = useToast();

  const handleGenerate = async (newFormat: string) => {
    setFormat(newFormat);
     if (!documentText) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Document content is not available to generate a citation.",
        });
        return;
    }
    setIsLoading(true);
    setCitation("");

    try {
        const result = await generateCitations({ text: documentText, format: newFormat as any });
        setCitation(result.citations);
    } catch(error) {
        console.error("Error generating citations:", error);
        toast({
            variant: "destructive",
            title: "AI Error",
            description: "Failed to generate citations.",
        });
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    if (citation) {
        navigator.clipboard.writeText(citation);
        toast({
            title: "Copied to clipboard!",
            description: `Citation in ${format} format has been copied.`,
        })
    }
  }

  return (
    <div className="flex flex-col h-full p-4 pt-0">
      <div className="flex items-center gap-2 mb-4">
        <Select defaultValue={format} onValueChange={handleGenerate}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select citation format" />
          </SelectTrigger>
          <SelectContent>
            {citationFormats.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="flex-1 relative">
        <CardContent className="p-4 h-full">
            {isLoading ? (
              <div className="space-y-2">
                 <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : citation ? (
              <div>
                <p className="text-sm whitespace-pre-wrap text-muted-foreground">{citation}</p>
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <Sparkles className="h-10 w-10 mb-2" />
                    <p className="text-sm">Select a format to generate a citation.</p>
                </div>
            )}
        </CardContent>
         {citation && !isLoading && (
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleCopy}>
                <Copy className="h-4 w-4" />
            </Button>
         )}
      </Card>
    </div>
  );
}
