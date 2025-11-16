'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/lib/firebase/error-emitter';
import type { FirestorePermissionError } from '@/lib/firebase/errors';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: FirestorePermissionError) => {
      // Throw the error to let Next.js Development Overlay handle it
      throw error;
    };
    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);
  return null;
}
