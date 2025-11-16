import { EventEmitter } from 'events';
import type { FirestorePermissionError } from './errors';

type FirebasePermissionErrorEvents = {
  'permission-error': (error: FirestorePermissionError) => void;
};

class FirebasePermissionErrorEmitter extends EventEmitter {
  emit<E extends keyof FirebasePermissionErrorEvents>(
    event: E,
    ...args: Parameters<FirebasePermissionErrorEvents[E]>
  ) {
    return super.emit(event, ...args);
  }
  on<E extends keyof FirebasePermissionErrorEvents>(
    event: E,
    listener: FirebasePermissionErrorEvents[E]
  ): this {
    return super.on(event, listener);
  }
}

export const errorEmitter = new FirebasePermissionErrorEmitter();
