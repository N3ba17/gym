import { usePage } from '@inertiajs/react';
import { router } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { LogOut, Settings, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useInitials } from '@/hooks/use-initials';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { logout } from '@/routes';

export function NavUser() {
    const { auth } = usePage().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();
    const getInitials = useInitials();
    const isCollapsed = state === 'collapsed';

    if (!auth.user) {
        return null;
    }

    const handleLogout = () => {
        router.post(logout());
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className={cn(
                                "w-full h-auto py-2 px-3 rounded-xl transition-all duration-200 hover:bg-sidebar-accent data-[state=open]:bg-sidebar-accent",
                                isCollapsed && "lg:justify-center lg:p-0"
                            )}
                        >
                            <Avatar className="size-8 overflow-hidden rounded-lg shrink-0">
                                <AvatarImage src={auth.user?.avatar} alt={auth.user?.name} />
                                <AvatarFallback className="rounded-lg bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
                                    {getInitials(auth.user?.name ?? '')}
                                </AvatarFallback>
                            </Avatar>
                            <div className={cn(
                                "grid flex-1 text-left text-sm leading-tight overflow-hidden group-data-[collapsible=icon]:hidden",
                                isCollapsed && "lg:hidden"
                            )}>
                                <span className="truncate font-semibold text-sidebar-foreground text-xs">
                                    {auth.user?.name}
                                </span>
                                <span className="truncate text-xs text-sidebar-foreground/50">
                                    {auth.user?.email}
                                </span>
                            </div>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-64 rounded-xl p-2"
                        align={isMobile ? 'center' : 'end'}
                        side={isMobile ? 'bottom' : 'top'}
                    >
                        <div className="px-3 py-2 rounded-lg bg-sidebar-accent/50 mb-1">
                            <p className="text-sm font-semibold">{auth.user?.name}</p>
                            <p className="text-xs text-muted-foreground">{auth.user?.email}</p>
                        </div>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                            <Link href="/profile" className="flex items-center gap-2">
                                <User className="size-4" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                            <Link href="/settings" className="flex items-center gap-2">
                                <Settings className="size-4" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="my-1" />
                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="rounded-lg cursor-pointer text-rose-600 hover:bg-rose-50 focus:bg-rose-50"
                        >
                            <LogOut className="size-4" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
