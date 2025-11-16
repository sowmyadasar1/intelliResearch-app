import { Header } from '@/components/layout/header';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ChatHistoryProvider } from '@/context/chat-history-context';
import { SummaryHistoryProvider } from '@/context/summary-history-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ChatHistoryProvider>
        <SummaryHistoryProvider>
          <div className="flex min-h-screen">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                  <Header />
                  <main className="flex-1 p-4 lg:p-6">{children}</main>
              </div>
          </div>
        </SummaryHistoryProvider>
      </ChatHistoryProvider>
    </SidebarProvider>
  );
}
