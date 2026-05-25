import { Bell } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { BreadcrumbItem } from '@/types';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

export function AppHeader({ breadcrumbs = [] }: Props) {
    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-sidebar-border/60 bg-background/80 backdrop-blur-md px-4 md:px-6">
            <SidebarTrigger className="h-9 w-8 rounded-xl hover:bg-sidebar-accent transition-colors" />

            <div className="hidden md:block">
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="ml-auto flex items-center gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl">
                            <Bell className="size-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Notifications</TooltipContent>
                </Tooltip>
            </div>
        </header>
    );
}