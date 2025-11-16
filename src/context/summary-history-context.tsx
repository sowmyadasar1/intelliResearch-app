
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getFirebaseInstances } from '@/lib/firebase/client';
import { collectionGroup, query, where, onSnapshot, Timestamp, DocumentReference } from 'firebase/firestore';

interface Summary {
  id: string;
  format: string;
  createdAt: Timestamp;
  ref: DocumentReference;
  [key: string]: any;
}

interface SummaryHistoryContextType {
  summaries: Summary[];
  loading: boolean;
  error: Error | undefined;
}

const SummaryHistoryContext = createContext<SummaryHistoryContextType | undefined>(undefined);

export const SummaryHistoryProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { firestore } = getFirebaseInstances();
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (user) {
      setLoading(true);
      // Query the 'summaries' subcollection across all documents for the current user
      const userDocPath = `users/${user.uid}`;
      const summariesQuery = query(collectionGroup(firestore, 'summaries'), where('__name__', '>=', userDocPath), where('__name__', '<', userDocPath + '\uf8ff'));
      
      const unsubscribe = onSnapshot(summariesQuery, (querySnapshot) => {
        const summaryData = querySnapshot.docs.map(doc => ({ id: doc.id, ref: doc.ref, ...doc.data() } as Summary));
        setSummaries(summaryData);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching summary history:", err);
        setError(err);
        setLoading(false);
      });

      return () => unsubscribe();
    } else if (!authLoading) {
      setSummaries([]);
      setLoading(false);
    }
  }, [user, authLoading, firestore]);

  const value = { summaries, loading, error };

  return (
    <SummaryHistoryContext.Provider value={value}>
      {children}
    </SummaryHistoryContext.Provider>
  );
};

export const useSummaryHistory = () => {
  const context = useContext(SummaryHistoryContext);
  if (context === undefined) {
    throw new Error('useSummaryHistory must be used within a SummaryHistoryProvider');
  }
  return context;
};
