import { Link, usePage } from '@inertiajs/react';
import {
    BarChart3,
    Boxes,
    ClipboardList,
    CookingPot,
    LayoutGrid,
    ReceiptText,
    ShoppingBag,
    TrendingUp,
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

const adminNavItems: NavItem[] = [
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

const staffNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/staff/dashboard',
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
        title: 'Purchase Orders',
        href: '/admin/purchase-orders',
        icon: ShoppingBag,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage().props as unknown as { auth: Auth };
    const isStaff = auth.user.role === 'staff';
    const homeHref = isStaff ? '/staff/dashboard' : dashboard();
    const navItems = isStaff
        ? staffNavItems
        : [
              ...adminNavItems,
              {
                  title: 'Staff',
                  href: '/admin/staff',
                  icon: UsersRound,
              },
          ];
    const sidebarTone = isStaff
        ? '[--color-sidebar:#10382f] [--color-sidebar-accent:#f6b85e] [--color-sidebar-accent-foreground:#10231f] [--color-sidebar-border:#1d574b] [--color-sidebar-foreground:#f7fbf8] [--color-sidebar-ring:#f6b85e] [--sidebar:#10382f] [--sidebar-accent:#f6b85e] [--sidebar-accent-foreground:#10231f] [--sidebar-border:#1d574b] [--sidebar-foreground:#f7fbf8] [--sidebar-ring:#f6b85e] [&_[data-sidebar=sidebar]]:bg-[#10382f] [&_[data-sidebar=sidebar]]:text-white [&_[data-slot=sidebar-footer]]:border-t [&_[data-slot=sidebar-footer]]:border-white/10 [&_[data-slot=sidebar-header]]:border-b [&_[data-slot=sidebar-header]]:border-white/10'
        : '';

    return (
        <Sidebar
            collapsible="icon"
            variant={isStaff ? 'sidebar' : 'inset'}
            className={sidebarTone}
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className={
                                isStaff
                                    ? 'h-12 rounded-lg text-white hover:bg-white/10 hover:text-white data-[state=open]:bg-white/10 data-[state=open]:text-white'
                                    : ''
                            }
                        >
                            <Link href={homeHref} prefetch>
                                <AppLogo />
                                {isStaff && (
                                    <span className="ml-auto rounded-full bg-[#f6b85e] px-2 py-0.5 text-[10px] font-bold tracking-normal text-[#10231f] uppercase group-data-[collapsible=icon]/sidebar-wrapper:hidden">
                                        Staff
                                    </span>
                                )}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain
                    items={navItems}
                    tone={isStaff ? 'staff' : 'default'}
                />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
