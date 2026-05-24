import { Head, Link } from '@inertiajs/react';
import {
    ClipboardList,
    CookingPot,
    PackageMinus,
    ReceiptText,
    ShoppingBag,
    Store,
    Utensils,
} from 'lucide-react';

type Summary = {
    today_orders: number;
    month_sales: number;
    low_stock_items: number;
    critical_items: number;
    total_inventory_items: number;
    open_purchase_orders: number;
    active_production_batches: number;
};

type StatCard = {
    label: string;
    value: string;
    delta: string;
    tone: 'positive' | 'negative';
    bars: number[];
};

type ForecastAlert = {
    name: string;
    sku: string;
    current_stock: number;
    reorder_point: number;
    unit: string;
    risk_level: string;
};

type Props = {
    summary: Summary;
    statCards: StatCard[];
    forecastAlerts: ForecastAlert[];
    dateRangeLabel: string;
    welcomeMessage: string;
};

const quickLinks = [
    {
        label: 'Inventory',
        href: '/admin/inventory',
        icon: PackageMinus,
    },
    {
        label: 'Production',
        href: '/admin/production',
        icon: CookingPot,
    },
    {
        label: 'Recipe / BOM',
        href: '/admin/recipes',
        icon: Utensils,
    },
    {
        label: 'POS',
        href: '/admin/pos',
        icon: ReceiptText,
    },
    {
        label: 'Purchase Orders',
        href: '/admin/purchase-orders',
        icon: ShoppingBag,
    },
];

export default function StaffDashboard({
    summary,
    statCards,
    forecastAlerts,
    dateRangeLabel,
    welcomeMessage,
}: Props) {
    return (
        <>
            <Head title="Staff Dashboard" />

            <main className="min-h-screen bg-[#f4f5f5] p-4 text-[#202936] sm:p-5">
                <section className="rounded-lg border border-[#dfe4ea] bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold tracking-normal text-[#687280] uppercase">
                                Staff Dashboard
                            </p>
                            <h1 className="mt-1 text-2xl font-semibold">
                                Welcome to your workspace
                            </h1>
                            <p className="mt-2 max-w-3xl text-sm text-[#687280]">
                                {welcomeMessage}
                            </p>
                        </div>
                        <div className="rounded-md border border-[#dfe4ea] px-3 py-2 text-sm font-medium">
                            {dateRangeLabel}
                        </div>
                    </div>
                </section>

                <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {statCards.slice(0, 3).map((stat) => (
                        <article
                            key={stat.label}
                            className="rounded-lg border border-[#dfe4ea] bg-white p-5"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <span className="grid size-11 place-items-center rounded-md bg-[#10382f] text-white">
                                    <Store className="size-5" />
                                </span>
                                <span
                                    className={`rounded-md px-2 py-1 text-xs font-semibold ${
                                        stat.tone === 'negative'
                                            ? 'bg-[#fff4e7] text-[#9a4b00]'
                                            : 'bg-emerald-50 text-emerald-700'
                                    }`}
                                >
                                    {stat.delta}
                                </span>
                            </div>
                            <p className="mt-5 text-3xl font-semibold">
                                {stat.value}
                            </p>
                            <p className="mt-1 text-sm text-[#687280]">
                                {stat.label}
                            </p>
                        </article>
                    ))}
                    <article className="rounded-lg border border-[#dfe4ea] bg-white p-5">
                        <div className="grid size-11 place-items-center rounded-md bg-[#faa340] text-[#10231f]">
                            <ClipboardList className="size-5" />
                        </div>
                        <p className="mt-5 text-3xl font-semibold">
                            {summary.open_purchase_orders}
                        </p>
                        <p className="mt-1 text-sm text-[#687280]">
                            Open purchase orders
                        </p>
                    </article>
                </section>

                <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <article className="rounded-lg border border-[#dfe4ea] bg-white">
                        <header className="border-b border-[#e7ebef] px-5 py-4">
                            <h2 className="text-lg font-semibold">
                                Staff Shortcuts
                            </h2>
                        </header>
                        <div className="grid gap-3 p-5 sm:grid-cols-2">
                            {quickLinks.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center gap-3 rounded-lg border border-[#dfe4ea] p-4 text-sm font-semibold transition hover:border-[#faa340] hover:text-[#9a4b00]"
                                    >
                                        <span className="grid size-10 place-items-center rounded-md bg-[#f8f9fa]">
                                            <Icon className="size-5" />
                                        </span>
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </article>

                    <article className="rounded-lg border border-[#dfe4ea] bg-white">
                        <header className="border-b border-[#e7ebef] px-5 py-4">
                            <h2 className="text-lg font-semibold">
                                Inventory Alerts
                            </h2>
                        </header>
                        <div className="space-y-3 p-5">
                            {forecastAlerts.length > 0 ? (
                                forecastAlerts.map((item) => (
                                    <div
                                        key={item.sku}
                                        className="rounded-md border border-[#dfe4ea] p-3"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="font-semibold">
                                                {item.name}
                                            </p>
                                            <span className="rounded-md bg-[#fff4e7] px-2 py-1 text-xs font-semibold text-[#9a4b00]">
                                                {item.risk_level}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-[#687280]">
                                            Stock: {item.current_stock}{' '}
                                            {item.unit} / Reorder:{' '}
                                            {item.reorder_point} {item.unit}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="rounded-md border border-dashed border-[#dfe4ea] p-4 text-sm text-[#687280]">
                                    No urgent inventory alerts right now.
                                </p>
                            )}
                        </div>
                    </article>
                </section>
            </main>
        </>
    );
}
