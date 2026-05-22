import { Link } from '@inertiajs/react';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export function NavMain({
    items = [],
    tone = 'default',
}: {
    items: NavItem[];
    tone?: 'default' | 'staff';
}) {
    const { isCurrentUrl } = useCurrentUrl();
    const isStaff = tone === 'staff';

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel
                className={
                    isStaff
                        ? 'text-white/60 group-data-[collapsible=icon]:opacity-0'
                        : ''
                }
            >
                Platform
            </SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrentUrl(item.href)}
                            className={
                                isStaff
                                    ? 'h-10 rounded-lg text-white/78 hover:bg-white/10 hover:text-white data-[active=true]:bg-[#f6b85e] data-[active=true]:font-semibold data-[active=true]:text-[#10231f] data-[active=true]:shadow-[0_10px_24px_rgba(0,0,0,0.16)]'
                                    : ''
                            }
                            tooltip={{ children: item.title }}
                        >
                            <Link href={item.href} prefetch>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
