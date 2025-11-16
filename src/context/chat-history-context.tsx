
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getFirebaseInstances } from '@/lib/firebase/client';
import { collection, query, onSnapshot, collectionGroup, where, Timestamp, DocumentReference } from 'firebase/firestore';
import { useDocumentContext } from './document-context';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Timestamp;
  ref: DocumentReference;
  [key: string]: any;
}

interface ChatHistoryContextType {
  messages: ChatMessage[];
  loading: boolean;
  error: Error | undefined;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export const ChatHistoryProvider = ({ children }: { children: ReactNode }) => {
  const { user, loading: authLoading } = useAuth();
  const { firestore } = getFirebaseInstances();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (user) {
      setLoading(true);
      // This query listens to the 'chats' subcollection across ALL documents for the current user.
      const userDocPath = `users/${user.uid}`;
      const chatsQuery = query(collectionGroup(firestore, 'chats'), where('__name__', '>=', userDocPath), where('__name__', '<', userDocPath + '\uf8ff'));
      
      const unsubscribe = onSnapshot(chatsQuery, (querySnapshot) => {
        const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ref: doc.ref, ...doc.data() } as ChatMessage));
        setMessages(msgs);
        setLoading(false);
      }, (err) => {
        console.error("Error fetching chat history:", err);
        setError(err);
        setLoading(false);
      });

      return () => unsubscribe();
    } else if (!authLoading) {
      setMessages([]);
      setLoading(false);
    }
  }, [user, authLoading, firestore]);

  const value = { messages, loading, error };

  return (
    <ChatHistoryContext.Provider value={value}>
      {children}
    </ChatHistoryContext.Provider>
  );
};

export const useChatHistory = () => {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error('useChatHistory must be used within a ChatHistoryProvider');
  }
  return context;
};
