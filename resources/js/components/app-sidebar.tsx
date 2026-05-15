import { Link } from '@inertiajs/react';
import {
    BarChart3,
    BookOpen,
    Boxes,
    ClipboardList,
    CookingPot,
    LayoutGrid,
    ReceiptText,
    ShoppingBag,
    Truck,
    Utensils,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Inventory',
        href: dashboard(),
        icon: Boxes,
    },
    {
        title: 'Production',
        href: dashboard(),
        icon: CookingPot,
    },
    {
        title: 'Menu & Recipe',
        href: dashboard(),
        icon: Utensils,
    },
    {
        title: 'Sales',
        href: dashboard(),
        icon: ReceiptText,
    },
    {
        title: 'Forecasting',
        href: dashboard(),
        icon: BarChart3,
    },
    {
        title: 'Supplier',
        href: dashboard(),
        icon: Truck,
    },
    {
        title: 'Purchase Orders',
        href: dashboard(),
        icon: ShoppingBag,
    },
    {
        title: 'Reports',
        href: dashboard(),
        icon: ClipboardList,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
