
import type { Metadata } from 'next';
import { Toaster } from "@/components/ui/toaster";
import './globals.css';
import { cn } from '@/lib/utils';
import { AuthProvider } from '@/hooks/use-auth';
import { DocumentProvider } from '@/context/document-context';
import { FirebaseErrorListener } from '@/components/layout/FirebaseErrorListener';

export const metadata: Metadata = {
  title: 'intelliResearch',
  description: 'AI Research Assistant – Intelligent Academic Companion',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,200..900;1,7..72,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className={cn(
        "min-h-screen bg-background font-body antialiased"
      )}>
        <AuthProvider>
          <DocumentProvider>
            {children}
            <FirebaseErrorListener />
          </DocumentProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
