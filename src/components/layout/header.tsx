
'use client';

import {
  FileText,
  LogOut,
  Search,
  User,
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Input } from '../ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';
import { getFirebaseInstances } from '@/lib/firebase/client';
import { useState, useMemo, useEffect } from 'react';
import { useDocumentContext } from '@/context/document-context';
import { useSidebar } from '../ui/sidebar';
import { cn } from '@/lib/utils';

export function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { documents } = useDocumentContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { isMobile, state } = useSidebar();


  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    return documents.filter(doc =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, documents]);

  const handleSignOut = async () => {
    const { auth } = getFirebaseInstances();
    await auth.signOut();
    router.push('/');
  };

  const getUserInitials = (name: string | null | undefined): string => {
    if (!name) return 'U';
    const nameParts = name.split(' ').filter(Boolean);
    if (nameParts.length > 1) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return nameParts[0][0].toUpperCase();
  }

  const handleResultClick = () => {
    setSearchQuery('');
    setIsFocused(false);
  }
  
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('[data-search-container]')) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm lg:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className={cn(isMobile ? 'inline-flex' : 'hidden')} />
        <div className="relative hidden md:block w-full max-w-sm mr-4" data-search-container>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search documents, topics..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
            />
            {isFocused && searchQuery && (
              <div className="absolute top-full mt-2 w-full rounded-md border bg-card text-card-foreground shadow-lg z-50">
                <div className="p-2">
                  {searchResults.length > 0 ? (
                    searchResults.map(doc => (
                      <Link href={`/documents/${doc.id}`} key={doc.id} onClick={handleResultClick}>
                        <div className="flex items-center gap-3 p-2 rounded-md hover:bg-accent">
                          <FileText className="h-4 w-4 text-muted-foreground"/>
                          <span className="text-sm">{doc.title}</span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="p-2 text-center text-sm text-muted-foreground">
                      No results found.
                    </div>
                  )}
                </div>
              </div>
            )}
        </div>
      </div>
      <div className="flex flex-1 items-center justify-end gap-4">

        {loading ? (
          <Skeleton className="h-10 w-10 rounded-full" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                   <AvatarImage src={user.photoURL || undefined} alt="User Avatar" />
                  <AvatarFallback>{getUserInitials(user.displayName)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button asChild>
            <Link href="/">Sign In</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
