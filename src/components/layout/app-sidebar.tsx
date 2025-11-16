
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Settings,
  GanttChart,
  LogOut,
  Sparkles,
  PanelLeft,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { ThemeToggle } from './theme-toggle';
import { getFirebaseInstances } from '@/lib/firebase/client';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/documents', label: 'My Documents', icon: FileText },
  { href: '/literature-review', label: 'AI Research Assistant', icon: Sparkles },
];

function UserProfile() {
    const { user, loading } = useAuth();
    const { state, isMobile } = useSidebar();
    const isCollapsed = state === 'collapsed' && !isMobile;

    const getUserInitials = (name: string | null | undefined): string => {
        if (!name) return 'U';
        const nameParts = name.split(' ').filter(Boolean);
        if (nameParts.length > 1) {
            return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
        }
        return nameParts[0][0].toUpperCase();
    }

    if (loading) {
        return (
            <div className="flex items-center gap-3 p-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className={cn("flex-1 space-y-1", isCollapsed && "hidden")}>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
        )
    }

    if (user) {
        return (
             <div className={cn("flex items-center gap-3 p-2 overflow-hidden", isCollapsed && "justify-center")}>
                <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || undefined} alt="User Avatar"  />
                    <AvatarFallback>{getUserInitials(user.displayName)}</AvatarFallback>
                </Avatar>
                {!isCollapsed && (
                    <div className='overflow-hidden'>
                        <p className="font-semibold truncate">{user.displayName || "User"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                )}
            </div>
        )
    }

    return null;
}


export function AppSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const router = useRouter();
  const { state, isMobile, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed' && !isMobile;


  const handleSignOut = async () => {
    const { auth } = getFirebaseInstances();
    await auth.signOut();
    router.push('/');
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Button variant="ghost" className="h-auto w-full justify-start p-2" onClick={toggleSidebar}>
            <div className={cn("flex items-center gap-3", isCollapsed && "justify-center w-full")}>
                <GanttChart className="h-8 w-8 text-primary" />
                {!isCollapsed && (
                    <div className="flex flex-col">
                    <h2 className="text-lg font-semibold tracking-tight font-headline">intelliResearch</h2>
                    </div>
                )}
            </div>
        </Button>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                  className={cn(isCollapsed && 'justify-center')}
                >
                  <item.icon />
                  {!isCollapsed && <span>{item.label}</span>}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <div className={cn("space-y-2 p-2", isCollapsed && "flex flex-col items-center")}>
            <UserProfile />
            <ThemeToggle />
        </div>
        <Separator />
        <SidebarMenu>
            <SidebarMenuItem>
                <Link href="/profile">
                    <SidebarMenuButton
                        isActive={pathname.startsWith('/profile')}
                        tooltip="Profile"
                        className={cn(isCollapsed && 'justify-center')}
                    >
                    <Settings />
                    {!isCollapsed && <span>Profile</span>}
                    </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton onClick={handleSignOut} tooltip="Log out" className={cn(isCollapsed && 'justify-center')}>
                    <LogOut />
                    {!isCollapsed && <span>Log out</span>}
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
