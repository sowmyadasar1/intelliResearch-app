export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;
  constructor(context: SecurityRuleContext) {
    const contextString = JSON.stringify(
      {
        auth: 'Please sign-in and re-run this operation to see your auth context.',
        ...context,
      },
      null,
      2
    );

    super(
      `FirestoreError: Missing or insufficient permissions: The following request was denied by Firestore Security Rules:\n${contextString}`
    );
    this.name = 'FirestorePermissionError';
    this.context = context;
  }
}
