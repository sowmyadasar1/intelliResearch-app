
"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Copy, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Logo } from "../icons";
import { useAuth } from "@/hooks/use-auth";
import { aiChatWithPdf } from "@/ai/flows/ai-chat-with-pdf";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseInstances } from "@/lib/firebase/client";
import { collection, addDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { errorEmitter } from "@/lib/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/lib/firebase/errors";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  citation?: {
    page: number;
    paper: string;
  }
};

export function ChatInterface({ documentId, documentText }: { documentId: string, documentText: string }) {
  const [input, setInput] = useState("");
  const [isAiResponding, setIsAiResponding] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { firestore } = getFirebaseInstances();

  const messagesRef = user ? collection(firestore, `users/${user.uid}/documents/${documentId}/chats`) : null;
  const [messagesSnapshot, messagesLoading, messagesError] = useCollection(
    messagesRef ? query(messagesRef, orderBy('createdAt', 'asc')) : null
  );

  const messages = messagesSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)) || [];

  useEffect(() => {
    if(scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
            top: scrollAreaRef.current.scrollHeight,
            behavior: 'smooth'
        });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isAiResponding || !user || !messagesRef) return;

    const userMessageContent = input;
    setInput("");
    
    const userMessageData = {
      role: 'user' as const,
      content: userMessageContent,
      createdAt: serverTimestamp(),
    };

    // Optimistically add user message, but don't await the addDoc
    addDoc(messagesRef, userMessageData).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: messagesRef.path,
            operation: 'create',
            requestResourceData: userMessageData,
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
    });

    setIsAiResponding(true);

    try {
        const response = await aiChatWithPdf({
            question: userMessageContent,
            pdfTextChunks: [documentText], 
        });

        const aiMessageData = {
            role: 'assistant' as const,
            content: response.answer,
            citations: response.citations, // Save citations
            createdAt: serverTimestamp(),
        };

        addDoc(messagesRef, aiMessageData).catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: messagesRef.path,
                operation: 'create',
                requestResourceData: aiMessageData,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        });

    } catch (error) {
        console.error("AI chat error:", error);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to get a response from the AI."
        })
        // Add the message back to the input to allow user to retry
        setInput(userMessageContent);
    } finally {
        setIsAiResponding(false);
    }
  };
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: "Copied to clipboard!",
        description: "The AI response has been copied.",
    });
  };

  const handleFeedback = (feedback: 'positive' | 'negative') => {
    toast({
        title: "Feedback received!",
        description: "Thank you for helping us improve.",
    });
    // Here you could add logic to save feedback to Firestore
  };

  const userInitials = user?.displayName
    ?.split(" ")
    .map((n) => n[0])
    .join("") || "U";

  return (
    <div className="flex flex-col h-full p-4 pt-0">
      <ScrollArea className="flex-1 pr-4 -mx-4 px-4" ref={scrollAreaRef as any}>
        {messagesLoading ? (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
        ) : messages.length === 0 && !isAiResponding ? (
            <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                <div className="space-y-2">
                    <Logo className="h-10 w-10 mx-auto" />
                    <h3 className="text-lg font-semibold">Start a conversation</h3>
                    <p className="text-sm">Ask a question about the document to begin. This chat uses a RAG model to generate answers from the text.</p>
                </div>
            </div>
        ) : (
            <div className="space-y-6">
                {messages.map((message) => (
                    <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                        message.role === "user" ? "justify-end" : ""
                    }`}
                    >
                    {message.role === "assistant" && (
                        <Avatar className="w-8 h-8 border-2 border-primary">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                            <Logo className="w-5 h-5" />
                        </AvatarFallback>
                        </Avatar>
                    )}
                    <div
                        className={`max-w-md rounded-lg p-3 ${
                        message.role === "user"
                            ? "bg-primary/20 text-foreground"
                            : "bg-secondary"
                        }`}
                    >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        {message.role === 'assistant' && (
                            <div className="flex items-center gap-2 mt-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleCopy(message.content)}>
                                    <Copy className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleFeedback('positive')}>
                                    <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleFeedback('negative')}>
                                    <ThumbsDown className="h-3 w-3" />
                                </Button>
                            </div>
                        )}
                    </div>
                    {message.role === "user" && (
                        <Avatar className="w-8 h-8">
                        <AvatarFallback>{userInitials}</AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                {isAiResponding && (
                    <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8 border-2 border-primary">
                            <AvatarFallback className="bg-primary text-primary-foreground">
                                <Logo className="w-5 h-5" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="max-w-md rounded-lg p-3 bg-secondary">
                           <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
            </div>
        )}
      </ScrollArea>
      <form onSubmit={handleSendMessage} className="mt-4 relative">
        <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the document..." 
            className="pr-12" 
            disabled={isAiResponding || messagesLoading}
        />
        <Button size="icon" type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={isAiResponding || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
