import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    CalendarClock,
    Users,
    Settings2,
    ToggleLeft,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
    useSidebar,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { dashboard, schedule } from '@/routes';
import registrationsRoutes from '@/routes/registrations';
import adminRoutes from '@/routes/admin';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
    },
    {
        title: 'Schedule',
        href: schedule(),
        icon: CalendarClock,
    },
    {
        title: 'Registrations',
        href: registrationsRoutes.index(),
        icon: Users,
    },
];

const settingsNavItems: NavItem[] = [
    {
        title: 'Settings',
        href: '/settings/profile',
        icon: Settings2,
    },
    {
        title: 'Registration',
        href: adminRoutes.registrationSettings(),
        icon: ToggleLeft,
    },
];

export function AppSidebar() {
    const { url } = usePage();
    const { state, isMobile } = useSidebar();
    const isCollapsed = state === 'collapsed';

    const isActive = (href: string): boolean => {
        return url === href || url.startsWith(href + '/');
    };

    return (
        <Sidebar collapsible="icon" variant="floating" className="z-40">
            <SidebarHeader className="border-b border-sidebar-border/50">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="hover:bg-sidebar-accent transition-all duration-200"
                        >
                            <Link href={dashboard()} className="flex items-center gap-3">
                                <div
                                    className="flex aspect-square size-10 items-center justify-center rounded-xl text-white shadow-lg shrink-0"
                                    style={{
                                        background: 'linear-gradient(135deg, #00adc5 0%, #008ba3 100%)',
                                        boxShadow: '0 4px 12px -2px rgba(0, 173, 197, 0.4)',
                                    }}
                                >
                                    <AppLogo className="size-5" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden overflow-hidden">
                                    <span className="truncate font-bold tracking-tight text-sidebar-foreground text-base">
                                        GYM Portal
                                    </span>
                                    <span className="truncate text-xs font-medium text-sidebar-foreground/60">
                                        EEC Administration
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="px-2 py-4">
                <SidebarGroup className="mb-6">
                    <SidebarGroupLabel className={cn(
                        "px-3 text-[10px] uppercase tracking-widest font-bold text-sidebar-foreground/40 mb-2",
                        isCollapsed && "lg:hidden"
                    )}>
                        Navigation
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {mainNavItems.map((item) => {
                                const active = isActive(String(item.href));

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            isActive={active}
                                            tooltip={isCollapsed ? { children: item.title } : undefined}
                                            className={cn(
                                                "h-11 rounded-xl transition-all duration-200",
                                                active
                                                    ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold shadow-sm"
                                                    : "hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground",
                                                isCollapsed && "lg:w-11 lg:justify-center"
                                            )}
                                        >
                                            <Link href={item.href}>
                                                {item.icon && (
                                                    <item.icon className={cn("size-5 shrink-0", active ? "text-sidebar-primary-foreground" : "")} />
                                                )}
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarGroup>
                    <SidebarGroupLabel className={cn(
                        "px-3 text-[10px] uppercase tracking-widest font-bold text-sidebar-foreground/40 mb-2",
                        isCollapsed && "lg:hidden"
                    )}>
                        System
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu className="gap-1">
                            {settingsNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        tooltip={isCollapsed ? { children: item.title } : undefined}
                                        className={cn(
                                            "h-11 rounded-xl transition-all duration-200 hover:bg-sidebar-accent text-sidebar-foreground/70 hover:text-sidebar-foreground",
                                            isCollapsed && "lg:w-11 lg:justify-center"
                                        )}
                                    >
                                        <Link href={item.href}>
                                            {item.icon && <item.icon className="size-5 shrink-0" />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/50 p-3">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}