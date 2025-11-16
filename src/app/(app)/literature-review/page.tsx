
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, BookCopy, Search, Milestone, BarChart3, Forward, Loader2, ExternalLink, MessageSquareQuote, Lightbulb, ShieldCheck, Sigma } from "lucide-react";
import { suggestRelatedPapers, type SuggestRelatedPapersOutput } from '@/ai/flows/suggest-related-papers';
import { critiqueArgument, type CritiqueArgumentOutput } from '@/ai/flows/critique-argument';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function LiteratureGapAnalysis() {
    const searchParams = useSearchParams();
    const initialTopic = searchParams.get('topic');
    
    const [topic, setTopic] = React.useState(initialTopic || '');
    const [results, setResults] = React.useState<SuggestRelatedPapersOutput | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [currentTopic, setCurrentTopic] = React.useState('');
    
    const handleGenerate = React.useCallback(async (analysisTopic: string) => {
      if (!analysisTopic) return;
      setIsLoading(true);
      setResults(null);
      setCurrentTopic(analysisTopic);
      try {
        const analysisResults = await suggestRelatedPapers({ topic: analysisTopic });
        setResults(analysisResults);
      } catch (error) {
        console.error("Error generating analysis:", error);
      } finally {
        setIsLoading(false);
      }
    }, []);

    React.useEffect(() => {
        if (initialTopic) {
            handleGenerate(initialTopic);
        }
    }, [initialTopic, handleGenerate]);
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Explore a Research Topic</CardTitle>
                    <CardDescription>Enter a topic to generate a detailed analysis of related papers, research gaps, and trends.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea 
                        placeholder="e.g., 'The application of Retrieval-Augmented Generation (RAG) in clinical decision support systems.'" 
                        rows={3}
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                    <Button onClick={() => handleGenerate(topic)} disabled={isLoading || !topic}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Analyzing...' : 'Generate Analysis'}
                    </Button>
                </CardContent>
            </Card>

            {isLoading && (
              <Card>
                <CardHeader>
                  <CardTitle>AI-Generated Insights</CardTitle>
                  <CardDescription>Generating insights for: "{currentTopic}"</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <p>The AI is working its magic... this may take a moment.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {results && !isLoading && (
                <Card>
                    <CardHeader>
                        <CardTitle>Analysis for: "{currentTopic}"</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-lg font-medium"><BookCopy className="mr-2 text-primary"/> Related Papers</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-none pl-0 space-y-3">
                                        {results.relatedPapers.map((paper, i) => (
                                          <li key={i}>
                                            <Link href={paper.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
                                                {paper.title}
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                          </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger className="text-lg font-medium"><Search className="mr-2 text-primary"/> Research Gaps</AccordionTrigger>
                                <AccordionContent>
                                <p className="text-muted-foreground">{results.researchGaps}</p>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-3">
                                <AccordionTrigger className="text-lg font-medium"><Milestone className="mr-2 text-primary"/> Suggested Subtopics</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                        {results.suggestedSubtopics.map((topic, i) => <li key={i}>{topic}</li>)}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-4">
                                <AccordionTrigger className="text-lg font-medium"><BarChart3 className="mr-2 text-primary"/> Summary of Trends</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-muted-foreground">{results.summaryOfTrends}</p>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-5">
                                <AccordionTrigger className="text-lg font-medium"><Forward className="mr-2 text-primary"/> Future Reading</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-muted-foreground">{results.recommendationsForFutureReading}</p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

function ArgumentCritique() {
    const [topic, setTopic] = React.useState('');
    const [thesis, setThesis] = React.useState('');
    const [results, setResults] = React.useState<CritiqueArgumentOutput | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [currentThesis, setCurrentThesis] = React.useState('');

    const handleGenerate = async () => {
      if (!topic || !thesis) return;
      setIsLoading(true);
      setResults(null);
      setCurrentThesis(thesis);
      try {
        const critiqueResults = await critiqueArgument({ topic, thesis });
        setResults(critiqueResults);
      } catch (error) {
        console.error("Error generating critique:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>AI-Powered Argument Critique</CardTitle>
                    <CardDescription>Enter your research topic and thesis statement to get a comprehensive AI-driven critique.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Textarea 
                        placeholder="Your broader research topic (e.g., 'Climate change impact on agriculture')" 
                        rows={2}
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                    <Textarea 
                        placeholder="Your thesis statement or main argument (e.g., 'The increasing frequency of droughts directly correlates with a 20% reduction in crop yields in Sub-Saharan Africa.')" 
                        rows={4}
                        value={thesis}
                        onChange={(e) => setThesis(e.target.value)}
                    />
                    <Button onClick={handleGenerate} disabled={isLoading || !topic || !thesis}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sigma className="mr-2 h-4 w-4" />}
                        {isLoading ? 'Critiquing...' : 'Critique My Argument'}
                    </Button>
                </CardContent>
            </Card>

             {isLoading && (
              <Card>
                <CardHeader>
                  <CardTitle>AI is Critiquing Your Argument</CardTitle>
                  <CardDescription>Thesis: "{currentThesis}"</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <p>Analyzing logical structure, identifying assumptions, and finding relevant literature...</p>
                  </div>
                </CardContent>
              </Card>
            )}

             {results && !isLoading && (
                <Card>
                    <CardHeader>
                        <CardTitle>Critique for: "{currentThesis}"</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="multiple" defaultValue={['item-1', 'item-2']} className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="text-lg font-medium"><ShieldCheck className="mr-2 text-green-500"/> Strengths</AccordionTrigger>
                                <AccordionContent>
                                     <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                        {results.strengths.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-2">
                                <AccordionTrigger className="text-lg font-medium"><Search className="mr-2 text-amber-500"/> Weaknesses & Flaws</AccordionTrigger>
                                <AccordionContent>
                                     <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                        {results.weaknesses.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger className="text-lg font-medium"><MessageSquareQuote className="mr-2 text-blue-500"/> Counter-Arguments</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                        {results.counterArguments.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-4">
                                <AccordionTrigger className="text-lg font-medium"><Lightbulb className="mr-2 text-yellow-500"/> Suggested Improvements</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                                        {results.suggestedImprovements.map((item, i) => <li key={i}>{item}</li>)}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                             <AccordionItem value="item-5">
                                <AccordionTrigger className="text-lg font-medium"><BookCopy className="mr-2 text-primary"/> Supporting Papers</AccordionTrigger>
                                <AccordionContent>
                                    <ul className="list-none pl-0 space-y-3">
                                        {results.supportingPapers.map((paper, i) => (
                                          <li key={i}>
                                            <Link href={paper.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline">
                                                {paper.title}
                                                <ExternalLink className="h-4 w-4" />
                                            </Link>
                                          </li>
                                        ))}
                                    </ul>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            )}

        </div>
    );
}

function ResearchAssistantPageContent() {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || "analysis";

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">AI Research Assistant</h1>
                <p className="text-muted-foreground">Leverage AI to analyze literature, identify research gaps, and strengthen your arguments.</p>
            </div>
            <Tabs defaultValue={initialTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="analysis">Literature & Gap Analysis</TabsTrigger>
                    <TabsTrigger value="critique">Argument Critique</TabsTrigger>
                </TabsList>
                <TabsContent value="analysis" className="pt-6">
                    <LiteratureGapAnalysis />
                </TabsContent>
                <TabsContent value="critique" className="pt-6">
                    <ArgumentCritique />
                </TabsContent>
            </Tabs>
        </div>
    );
}


export default function ResearchAssistantPage() {
    return (
        <React.Suspense fallback={<div>Loading...</div>}>
            <ResearchAssistantPageContent />
        </React.Suspense>
    )
}