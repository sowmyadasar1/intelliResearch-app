
"use client";

import * as React from "react";
import { useAuth } from "@/hooks/use-auth";
import { getFirebaseInstances } from "@/lib/firebase/client";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
import { errorEmitter } from "@/lib/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/lib/firebase/errors";

type Note = {
    content: string;
    updatedAt: any;
};

export function NotesEditor({ documentId }: { documentId: string }) {
  const { user } = useAuth();
  const { firestore } = getFirebaseInstances();
  const [noteContent, setNoteContent] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const { toast } = useToast();
  
  const noteRef = user ? doc(firestore, `users/${user.uid}/documents/${documentId}/notes/main`) : null;

  // Load initial note content
  React.useEffect(() => {
    if (!noteRef) return;
    setIsLoading(true);
    const unsubscribe = onSnapshot(noteRef, (doc) => {
        if (doc.exists()) {
            setNoteContent(doc.data().content || "");
        }
        setIsLoading(false);
    }, (error) => {
        setIsLoading(false);
        const permissionError = new FirestorePermissionError({
            path: noteRef.path,
            operation: 'get',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
    });
    return () => unsubscribe();
  }, [noteRef]);
  
  // Debounced save function
  const debouncedSave = useDebouncedCallback(async (content: string) => {
    if (!noteRef) return;
    setIsSaving(true);
    const noteData = { content, updatedAt: new Date() };
    
    setDoc(noteRef, noteData, { merge: true })
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
                path: noteRef.path,
                operation: 'update',
                requestResourceData: noteData,
            } satisfies SecurityRuleContext);
            errorEmitter.emit('permission-error', permissionError);
        })
        .finally(() => {
            setTimeout(() => setIsSaving(false), 1000); // Keep saving indicator for a bit
        });
  }, 1500); // Save after 1.5 seconds of inactivity

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setNoteContent(newContent);
    debouncedSave(newContent);
  };
  
  return (
    <div className="flex flex-col h-full p-4 pt-0 relative">
        <div className="absolute top-2 right-6 text-xs text-muted-foreground flex items-center gap-2">
            {isSaving ? (
                <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Saving...</span>
                </>
            ) : !isLoading && (
                <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Saved</span>
                </>
            )}
        </div>
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <Textarea
          placeholder="Start typing your notes here... They will be saved automatically."
          className="flex-1 resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-2 text-base"
          value={noteContent}
          onChange={handleContentChange}
        />
      )}
    </div>
  );
}
