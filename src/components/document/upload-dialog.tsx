
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, File, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { getFirebaseInstances } from '@/lib/firebase/client';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/lib/firebase/errors';

export function UploadDialog({ 
  children
}: { 
  children?: React.ReactNode,
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { firestore } = getFirebaseInstances();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) {
        toast({
            variant: 'destructive',
            title: 'Upload failed',
            description: !user ? 'You must be signed in to upload documents.' : 'Please select a file to upload.',
        });
        return;
    }
    setIsUploading(true);
    
    try {
      // 1. Upload file to our API route for parsing
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to parse PDF.');
      }

      const { text } = await response.json();

      // 2. Save document metadata and content to Firestore
      const documentsCollectionRef = collection(firestore, 'users', user.uid, 'documents');
      const docData = {
          title: file.name,
          uploadedAt: serverTimestamp(),
          ownerId: user.uid,
          content: text, // Save the extracted text
      };
      
      addDoc(documentsCollectionRef, docData)
          .then(() => {
              toast({
                  title: "Upload Successful!",
                  description: `"${file.name}" has been added and processed.`,
              });
              setFile(null);
              setOpen(false);
          })
          .catch(async (serverError) => {
              const permissionError = new FirestorePermissionError({
                  path: documentsCollectionRef.path,
                  operation: 'create',
                  requestResourceData: docData,
              } satisfies SecurityRuleContext);
              errorEmitter.emit('permission-error', permissionError);
          });

    } catch (error: any) {
        console.error('Upload error:', error);
        toast({
            variant: 'destructive',
            title: 'Upload failed',
            description: error.message || 'An unexpected error occurred.',
        });
        // Let Firestore error handler catch Firestore-specific issues
        if (error.name !== 'FirestorePermissionError') {
             // Let the specific error emitter handle UI for permission errors
        }
    } finally {
        setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        setFile(null);
      }
    }}>
      <DialogTrigger asChild>{children || <Button><UploadCloud className="mr-2 h-4 w-4" />Upload Document</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload a PDF document to start analyzing it with AI. Max file size: 10MB.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div 
                className="flex items-center justify-center w-full"
                onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('bg-secondary');
                }}
                 onDragLeave={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('bg-secondary');
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('bg-secondary');
                    if (e.dataTransfer.files) {
                        setFile(e.dataTransfer.files[0]);
                    }
                }}
            >
                <Label htmlFor="document-upload" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 transition-colors hover:bg-secondary">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PDF (MAX. 10MB)</p>
                    </div>
                    <Input id="document-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
                </Label>
            </div>
            {file && (
                <div className="flex items-center justify-between p-3 border rounded-md bg-secondary/30">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <File className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Remove</Button>
                </div>
            )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>Cancel</Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? 'Uploading & Processing...' : 'Upload'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
