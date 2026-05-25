import { Breadcrumbs } from '@/components/breadcrumbs';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <header className="flex h-14 items-center gap-3 border-b border-sidebar-border/60 bg-background/50 px-4">
            <SidebarTrigger className="h-9 w-9 rounded-xl border border-transparent hover:bg-sidebar-accent transition-colors" />
            <Separator orientation="vertical" className="h-5" />
            <Breadcrumbs breadcrumbs={breadcrumbs} />
        </header>
    );
}
