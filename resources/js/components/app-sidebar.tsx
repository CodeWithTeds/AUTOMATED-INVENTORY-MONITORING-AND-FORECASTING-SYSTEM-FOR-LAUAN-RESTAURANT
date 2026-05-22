import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    TrendingUp,
    Boxes,
    ClipboardList,
    CookingPot,
    LayoutGrid,
    ReceiptText,
    ShoppingBag,
    Truck,
    Utensils,
    UsersRound,
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
import type { Auth, NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Inventory',
        href: '/admin/inventory',
        icon: Boxes,
    },
    {
        title: 'Production',
        href: '/admin/production',
        icon: CookingPot,
    },
    {
        title: 'Recipe / BOM',
        href: '/admin/recipes',
        icon: Utensils,
    },
    {
        title: 'POS',
        href: '/admin/pos',
        icon: ReceiptText,
    },
    {
        title: 'Sales',
        href: '/admin/sales',
        icon: TrendingUp,
    },
    {
        title: 'Forecasting',
        href: '/admin/forcasting',
        icon: BarChart3,
    },
    {
        title: 'Supplier',
        href: '/admin/suppliers',
        icon: Truck,
    },
    {
        title: 'Purchase Orders',
        href: '/admin/purchase-orders',
        icon: ShoppingBag,
    },
    {
        title: 'Reports',
        href: '/admin/report',
        icon: ClipboardList,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage().props as unknown as { auth: Auth };
    const navItems =
        auth.user.role === 'admin'
            ? [
                  ...mainNavItems,
                  {
                      title: 'Staff',
                      href: '/admin/staff',
                      icon: UsersRound,
                  },
              ]
            : mainNavItems;

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
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
