
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getFirebaseInstances } from '@/lib/firebase/client';
import { collection, query, onSnapshot, orderBy, Query, DocumentData } from 'firebase/firestore';

interface Document {
  id: string;
  [key: string]: any;
}

interface DocumentContextType {
  documents: Document[];
  loading: boolean;
  error: Error | undefined;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const DocumentProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { firestore } = getFirebaseInstances();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const documentsRef = collection(firestore, 'users', user.uid, 'documents');
      const q = query(documentsRef, orderBy('uploadedAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDocuments(docs);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching documents:", err);
        setError(err);
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setDocuments([]);
      setLoading(false);
    }
  }, [user, firestore]);

  const value = { documents, loading, error };

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocumentContext = () => {
  const context = useContext(DocumentContext);
  if (context === undefined) {
    throw new Error('useDocumentContext must be used within a DocumentProvider');
  }
  return context;
};
