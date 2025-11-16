
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileText, MoreVertical, Trash2, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { UploadDialog } from "@/components/document/upload-dialog";
import { useAuth } from "@/hooks/use-auth";
import { getFirebaseInstances } from "@/lib/firebase/client";
import { collection, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/lib/firebase/error-emitter";
import { FirestorePermissionError, type SecurityRuleContext } from "@/lib/firebase/errors";

export default function DocumentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { firestore } = getFirebaseInstances();
  const { toast } = useToast();

  const documentsRef = user ? collection(firestore, "users", user.uid, "documents") : null;
  const [documentsSnapshot, loading, error] = useCollection(
    documentsRef ? query(documentsRef, orderBy("uploadedAt", "desc")) : null
  );

  const documents = documentsSnapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) || [];

  const handleDelete = async (docId: string) => {
    if (!user) return;
    if (!confirm("Are you sure you want to delete this document and all its associated data? This action cannot be undone.")) {
      return;
    }
    const docRef = doc(firestore, "users", user.uid, "documents", docId);
    
    deleteDoc(docRef)
      .then(() => {
        toast({
          title: "Document deleted",
          description: "The document has been successfully removed.",
        });
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
            path: docRef.path,
            operation: 'delete',
        } satisfies SecurityRuleContext);
        errorEmitter.emit('permission-error', permissionError);
      });
  };

  const hasDocuments = documents.length > 0;

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight font-headline">My Documents</h1>
                <p className="text-muted-foreground">Manage your uploaded papers and research materials.</p>
            </div>
            {user && <UploadDialog />}
        </div>
        <Card>
            <CardHeader>
                <CardTitle>All Uploaded Documents</CardTitle>
                <CardDescription>You have {documents.length} document{documents.length !== 1 && 's'} in your library.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading || authLoading ? (
                    <div className="flex justify-center items-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : error ? (
                    <div className="text-center py-16 text-destructive">
                        <h3 className="text-lg font-medium">Error loading documents</h3>
                        <p className="text-sm">{error.message}</p>
                    </div>
                ) : hasDocuments ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead className="hidden lg:table-cell">Uploaded</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.map((doc) => (
                                <TableRow key={doc.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/documents/${doc.id}`} className="hover:underline">
                                            {doc.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell">
                                        {doc.uploadedAt ? format(doc.uploadedAt.toDate(), "PPP") : 'Pending...'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/documents/${doc.id}`}>
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    View & Chat
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(doc.id)}>
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-16">
                        <FileText className="mx-auto h-16 w-16 text-muted-foreground/50" />
                        <h3 className="mt-4 text-lg font-medium">No documents uploaded</h3>
                        <p className="mt-1 text-sm text-muted-foreground">Get started by uploading your first research paper.</p>
                        <UploadDialog>
                            <Button className="mt-4">
                                <Upload className="mr-2 h-4 w-4" />
                                Upload Document
                            </Button>
                        </UploadDialog>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
