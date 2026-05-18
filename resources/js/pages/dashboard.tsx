import { Head, Link, usePage } from '@inertiajs/react';
import {
    Bell,
    CalendarDays,
    CircleDollarSign,
    Inbox,
    PackageMinus,
    PlusCircle,
    Search,
    Settings,
    ShoppingCart,
    Store,
} from 'lucide-react';
import type { ReactNode } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from 'recharts';

type Summary = {
    today_orders: number;
    today_sales: number;
    month_sales: number;
    low_stock_items: number;
    critical_items: number;
    total_inventory_items: number;
    inventory_value: number;
    open_purchase_orders: number;
    open_purchase_value: number;
    active_production_batches: number;
};

type StatCard = {
    label: string;
    value: string;
    delta: string;
    tone: 'positive' | 'negative';
    bars: number[];
};

type MonthlyPerformance = {
    month: string;
    sales: number;
    purchases: number;
    sales_height: number;
    purchases_height: number;
};

type MixItem = {
    label: string;
    value: number;
    percent: number;
    color: string;
};

type ForecastAlert = {
    name: string;
    sku: string;
    current_stock: number;
    reorder_point: number;
    unit: string;
    forecast_quantity: number;
    suggested_restock_quantity: number;
    days_of_cover: number | null;
    risk_level: string;
    alert_percent: number;
};

type Props = {
    summary: Summary;
    statCards: StatCard[];
    monthlyPerformance: MonthlyPerformance[];
    productionStatusMix: MixItem[];
    quickOverviewMix: MixItem[];
    forecastAlerts: ForecastAlert[];
    topSellingItems: Array<{ name: string; quantity: number; revenue: number }>;
    dateRangeLabel: string;
};

const cardIcons = {
    'Low Stock': Store,
    'Critical Items': ShoppingCart,
    'Total Inventory': PackageMinus,
    'Total Earnings': CircleDollarSign,
};

function formatCompactPeso(value: number) {
    return `PHP ${new Intl.NumberFormat('en-PH', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value)}`;
}

function DateButton({ children }: { children: ReactNode }) {
    return (
        <button className="inline-flex h-11 items-center gap-2 rounded-md border border-[#dfe4ea] bg-white px-4 text-sm font-medium text-[#27313f] shadow-sm">
            <CalendarDays className="size-4" />
            {children}
        </button>
    );
}

function DonutPanel({
    title,
    items,
    emptyLabel,
}: {
    title: string;
    items: MixItem[];
    emptyLabel: string;
}) {
    const primary = items[0];

    return (
        <article className="overflow-hidden rounded-lg border border-[#dfe4ea] bg-white">
            <header className="flex items-center justify-between border-b border-[#e7ebef] px-6 py-5">
                <h2 className="text-xl font-semibold text-[#202936]">
                    {title}
                </h2>
                <DateButton>This Month</DateButton>
            </header>

            <div className="px-6 py-7">
                <div className="relative mx-auto size-44">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={
                                    items.length
                                        ? items
                                        : [
                                              {
                                                  label: 'Empty',
                                                  value: 1,
                                                  color: '#eef2f6',
                                              },
                                          ]
                                }
                                dataKey="value"
                                nameKey="label"
                                innerRadius={58}
                                outerRadius={86}
                                paddingAngle={items.length > 1 ? 3 : 0}
                                stroke="#ffffff"
                                strokeWidth={3}
                            >
                                {(items.length
                                    ? items
                                    : [
                                          {
                                              label: 'Empty',
                                              value: 1,
                                              color: '#eef2f6',
                                          },
                                      ]
                                ).map((item) => (
                                    <Cell key={item.label} fill={item.color} />
                                ))}
                            </Pie>
                            {items.length > 0 && (
                                <RechartsTooltip
                                    formatter={(
                                        value: unknown,
                                        name: unknown,
                                    ) => [
                                        `${Number(value)} item${Number(value) === 1 ? '' : 's'}`,
                                        String(name),
                                    ]}
                                />
                            )}
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="pointer-events-none absolute inset-0 grid place-items-center">
                        <div className="grid size-20 place-items-center rounded-full bg-white text-sm font-semibold text-[#202936] shadow-[0_8px_20px_rgba(4,4,4,0.06)]">
                            {primary ? `${primary.percent}%` : '0%'}
                        </div>
                    </div>
                </div>

                <div className="mt-7 space-y-3 text-sm">
                    {items.length > 0 ? (
                        items.map((item) => (
                            <div
                                key={item.label}
                                className="flex items-center justify-between"
                            >
                                <span className="flex items-center gap-2 text-[#687280]">
                                    <span
                                        className="size-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    {item.label}
                                </span>
                                <span className="font-medium text-[#202936]">
                                    {item.value} ({item.percent}%)
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="rounded-lg border border-dashed border-[#dfe4ea] p-4 text-center text-sm text-[#687280]">
                            {emptyLabel}
                        </p>
                    )}
                </div>
            </div>
        </article>
    );
}

export default function Dashboard({
    summary,
    statCards,
    monthlyPerformance,
    productionStatusMix,
    quickOverviewMix,
    forecastAlerts,
    topSellingItems,
    dateRangeLabel,
}: Props) {
    const { auth } = usePage().props as {
        auth: { user?: { name?: string } | null };
    };
    const firstName = auth.user?.name?.split(' ')[0] ?? 'Admin';
    const money = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 0,
    });
    const number = new Intl.NumberFormat('en-PH', {
        maximumFractionDigits: 2,
    });
    const chartData = monthlyPerformance.map((month) => ({
        ...month,
        Sales: month.sales,
        Purchases: month.purchases,
    }));

    return (
        <>
            <Head title="Dashboard" />

            <main className="min-h-screen bg-[#f4f5f5] font-sans text-[#202936]">
                <section className="min-w-0 flex-1">
                    <header className="sticky top-0 z-30 flex min-h-20 flex-wrap items-center justify-between gap-3 border-b border-[#e4e8ec] bg-white px-4 py-3 sm:px-5">
                        <div className="relative w-full max-w-[290px]">
                            <Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-[#9aa2ad]" />
                            <input
                                type="search"
                                placeholder="Search"
                                className="h-12 w-full rounded-lg border border-[#dfe4ea] bg-white px-11 pr-16 text-base outline-none placeholder:text-[#9aa2ad] focus:border-[#faa340] focus:ring-4 focus:ring-[#faa340]/15"
                            />
                            <span className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md bg-[#eef2f6] px-2 py-1 text-xs font-semibold text-[#202936]">
                                ⌘ K
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2">
                            <Link
                                href="/admin/inventory"
                                className="inline-flex h-10 items-center gap-2 rounded-md border border-[#dfe4ea] bg-white px-3 text-sm text-[#202936]"
                            >
                                <img
                                    src="/image.png"
                                    alt=""
                                    className="size-5 rounded object-cover"
                                />
                                Freshmart
                            </Link>
                            <Link
                                href="/admin/inventory"
                                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#faa340] px-4 text-sm font-medium text-white shadow-[0_10px_24px_rgba(250,163,64,0.26)]"
                            >
                                <PlusCircle className="size-4" />
                                Add New
                            </Link>
                            <Link
                                href="/admin/pos"
                                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#06294f] px-4 text-sm font-medium text-white"
                            >
                                <Store className="size-4" />
                                POS
                            </Link>
                            <Link
                                href="/admin/purchase-orders"
                                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#f8f9fa] px-3 text-sm font-medium text-[#202936]"
                            >
                                <Inbox className="size-5 text-[#6b7280]" />
                                Orders
                                <span className="rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white">
                                    {summary.open_purchase_orders}
                                </span>
                            </Link>
                            <Link
                                href="/admin/forcasting"
                                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#f8f9fa] px-3 text-sm font-medium text-[#202936]"
                            >
                                <Bell className="size-5 text-[#6b7280]" />
                                Alerts
                                <span className="rounded-full bg-[#fb4856] px-1.5 text-xs font-semibold text-white">
                                    {forecastAlerts.length}
                                </span>
                            </Link>
                            <Link
                                href="/admin/settings/profile"
                                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#fff4e7] px-3 text-sm font-medium text-[#faa340]"
                            >
                                <Settings className="size-5" />
                                Settings
                            </Link>
                        </div>
                    </header>

                    <div className="border-b border-[#e4e8ec] bg-white px-4 py-5 sm:px-5">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-semibold text-[#202936]">
                                    Welcome, {firstName}
                                </h1>
                                <p className="mt-1 text-base text-[#687280]">
                                    You have{' '}
                                    <span className="font-semibold text-[#faa340]">
                                        {summary.today_orders}
                                    </span>{' '}
                                    Orders, Today
                                </p>
                            </div>
                            <DateButton>{dateRangeLabel}</DateButton>
                        </div>
                    </div>

                    <div className="space-y-5 p-4 sm:p-5">
                        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {statCards.map((stat) => {
                                const Icon =
                                    cardIcons[
                                        stat.label as keyof typeof cardIcons
                                    ] ?? Store;

                                return (
                                    <article
                                        key={stat.label}
                                        className="rounded-lg border border-[#dfe4ea] bg-white p-5 shadow-[0_2px_6px_rgba(4,4,4,0.04)]"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="grid size-12 place-items-center rounded-md bg-[#172554] text-white">
                                                <Icon
                                                    className="size-5"
                                                    strokeWidth={1.8}
                                                />
                                            </div>
                                            <span
                                                className={`rounded-md px-2.5 py-1 text-xs font-semibold text-white ${
                                                    stat.tone === 'negative'
                                                        ? 'bg-red-600'
                                                        : 'bg-emerald-500'
                                                }`}
                                            >
                                                {stat.delta}
                                            </span>
                                        </div>

                                        <div className="mt-5 flex items-end justify-between gap-4">
                                            <div>
                                                <p className="text-[28px] leading-none font-semibold text-[#202936]">
                                                    {stat.value}
                                                </p>
                                                <p className="mt-2 text-sm text-[#687280]">
                                                    {stat.label}
                                                </p>
                                            </div>

                                            <div className="flex h-14 items-end gap-1.5">
                                                {stat.bars.map(
                                                    (height, index) => (
                                                        <span
                                                            key={`${stat.label}-${index}`}
                                                            className={`w-1.5 rounded-t-sm ${
                                                                stat.label ===
                                                                'Critical Items'
                                                                    ? 'bg-[#6842f5]'
                                                                    : stat.label ===
                                                                        'Total Inventory'
                                                                      ? 'bg-[#14b8d4]'
                                                                      : stat.label ===
                                                                          'Total Earnings'
                                                                        ? 'bg-emerald-500'
                                                                        : 'bg-[#faa340]'
                                                            }`}
                                                            style={{
                                                                height: `${height}%`,
                                                            }}
                                                        />
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </section>

                        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                            <article className="overflow-hidden rounded-lg border border-[#dfe4ea] bg-white">
                                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7ebef] px-5 py-4">
                                    <div className="flex items-start gap-3">
                                        <span className="grid size-10 place-items-center rounded-md bg-[#2ec66d]/10 text-[#2ec66d]">
                                            <ShoppingCart className="size-5" />
                                        </span>
                                        <div>
                                            <h2 className="text-xl font-semibold text-[#202936]">
                                                Revenue & Purchase Trend
                                            </h2>
                                            <p className="text-sm text-[#687280]">
                                                Monthly POS sales compared with
                                                purchase exposure
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Link
                                            href="/admin/sales"
                                            className="inline-flex h-10 items-center rounded-md border border-[#dfe4ea] bg-white px-4 text-sm font-medium text-[#202936] transition hover:border-[#faa340] hover:text-[#faa340]"
                                        >
                                            Sales
                                        </Link>
                                        <Link
                                            href="/admin/report"
                                            className="inline-flex h-10 items-center rounded-md bg-[#2ec66d] px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(46,198,109,0.22)] transition hover:bg-[#25a95b]"
                                        >
                                            Full Reports
                                        </Link>
                                    </div>
                                </header>

                                <div className="px-5 py-5">
                                    <div className="mb-6 flex gap-3">
                                        <div className="rounded-lg border border-[#dfe4ea] px-3 py-3">
                                            <p className="flex items-center gap-2 text-base text-[#687280]">
                                                <span className="size-2 rounded-full bg-[#fedec1]" />
                                                Total Purchase
                                            </p>
                                            <p className="mt-2 text-2xl font-semibold">
                                                {money.format(
                                                    summary.open_purchase_value,
                                                )}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-[#dfe4ea] px-3 py-3">
                                            <p className="flex items-center gap-2 text-base text-[#687280]">
                                                <span className="size-2 rounded-full bg-[#faa340]" />
                                                Total Sales
                                            </p>
                                            <p className="mt-2 text-2xl font-semibold">
                                                {money.format(
                                                    summary.month_sales,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="h-72 w-full">
                                        <ResponsiveContainer
                                            width="100%"
                                            height="100%"
                                        >
                                            <AreaChart
                                                data={chartData}
                                                margin={{
                                                    top: 8,
                                                    right: 14,
                                                    bottom: 4,
                                                    left: 0,
                                                }}
                                            >
                                                <defs>
                                                    <linearGradient
                                                        id="dashboardSales"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="5%"
                                                            stopColor="#2ec66d"
                                                            stopOpacity={0.32}
                                                        />
                                                        <stop
                                                            offset="95%"
                                                            stopColor="#2ec66d"
                                                            stopOpacity={0}
                                                        />
                                                    </linearGradient>
                                                    <linearGradient
                                                        id="dashboardPurchases"
                                                        x1="0"
                                                        y1="0"
                                                        x2="0"
                                                        y2="1"
                                                    >
                                                        <stop
                                                            offset="5%"
                                                            stopColor="#faa340"
                                                            stopOpacity={0.2}
                                                        />
                                                        <stop
                                                            offset="95%"
                                                            stopColor="#faa340"
                                                            stopOpacity={0}
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid
                                                    stroke="#e5e7eb"
                                                    strokeDasharray="3 3"
                                                    vertical={false}
                                                />
                                                <XAxis
                                                    dataKey="month"
                                                    stroke="#888888"
                                                    fontSize={11}
                                                    tickLine={false}
                                                    axisLine={false}
                                                />
                                                <YAxis
                                                    stroke="#888888"
                                                    fontSize={11}
                                                    tickLine={false}
                                                    axisLine={false}
                                                    width={78}
                                                    tickFormatter={(
                                                        value: number,
                                                    ) =>
                                                        formatCompactPeso(value)
                                                    }
                                                />
                                                <RechartsTooltip
                                                    cursor={{
                                                        stroke: '#2ec66d',
                                                        strokeDasharray: '4 4',
                                                    }}
                                                    formatter={(
                                                        value: unknown,
                                                        name: unknown,
                                                    ) => [
                                                        money.format(
                                                            Number(value),
                                                        ),
                                                        String(name),
                                                    ]}
                                                    labelStyle={{
                                                        color: '#202936',
                                                        fontWeight: 700,
                                                    }}
                                                    contentStyle={{
                                                        borderRadius: 12,
                                                        borderColor: '#dfe4ea',
                                                        boxShadow:
                                                            '0 14px 35px rgba(4,4,4,0.12)',
                                                    }}
                                                />
                                                <Legend
                                                    verticalAlign="top"
                                                    align="right"
                                                    iconType="circle"
                                                    wrapperStyle={{
                                                        paddingBottom: 10,
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="Purchases"
                                                    stroke="#faa340"
                                                    strokeWidth={2.5}
                                                    fill="url(#dashboardPurchases)"
                                                    dot={false}
                                                    activeDot={{
                                                        r: 5,
                                                        fill: '#faa340',
                                                        stroke: '#ffffff',
                                                        strokeWidth: 2,
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="Sales"
                                                    stroke="#2ec66d"
                                                    strokeWidth={2.5}
                                                    fill="url(#dashboardSales)"
                                                    dot={false}
                                                    activeDot={{
                                                        r: 6,
                                                        fill: '#2ec66d',
                                                        stroke: '#ffffff',
                                                        strokeWidth: 2,
                                                    }}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </article>

                            <DonutPanel
                                title="Production"
                                items={productionStatusMix}
                                emptyLabel="No production batches yet."
                            />
                        </section>

                        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                            <article className="rounded-lg border border-[#dfe4ea] bg-white p-5">
                                <div className="mb-10 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">
                                        Forecast Alert
                                    </h2>
                                    <Link
                                        href="/admin/forcasting"
                                        className="inline-flex h-11 items-center gap-2 rounded-md border border-[#dfe4ea] bg-white px-4 text-sm font-medium text-[#27313f] shadow-sm transition hover:border-[#fb4856] hover:text-[#fb4856]"
                                    >
                                        View Forecasting
                                    </Link>
                                </div>
                                <div className="space-y-5">
                                    {forecastAlerts.length > 0 ? (
                                        forecastAlerts.map((item) => {
                                            const dangerWidth = Math.max(
                                                8,
                                                100 - item.alert_percent,
                                            );

                                            return (
                                                <div
                                                    key={item.sku}
                                                    className="grid grid-cols-[minmax(110px,160px)_1fr_auto] items-center gap-4"
                                                >
                                                    <div className="min-w-0">
                                                        <span className="block truncate text-sm font-medium text-[#202936]">
                                                            {item.name}
                                                        </span>
                                                        <span className="block truncate text-xs text-[#9aa2ad]">
                                                            {item.sku}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center justify-between gap-3 text-xs text-[#687280]">
                                                            <span>
                                                                Stock:{' '}
                                                                {number.format(
                                                                    item.current_stock,
                                                                )}{' '}
                                                                {item.unit}
                                                            </span>
                                                            <span>
                                                                Forecast:{' '}
                                                                {number.format(
                                                                    item.forecast_quantity,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="mt-1 h-2 overflow-hidden rounded-full bg-[#dfe4ea]">
                                                            <span
                                                                className="block h-full rounded-full bg-[#fb4856]"
                                                                style={{
                                                                    width: `${dangerWidth}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <span className="rounded-md bg-[#fb4856]/10 px-2 py-1 text-xs font-semibold text-[#fb4856]">
                                                        {item.risk_level ===
                                                        'critical'
                                                            ? 'Critical'
                                                            : 'Watch'}{' '}
                                                        · Restock{' '}
                                                        {number.format(
                                                            item.suggested_restock_quantity,
                                                        )}
                                                    </span>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="rounded-lg border border-dashed border-[#dfe4ea] p-5 text-center text-sm text-[#687280]">
                                            No forecast alerts right now.
                                        </p>
                                    )}
                                </div>
                            </article>

                            <DonutPanel
                                title="Quick Overview"
                                items={quickOverviewMix}
                                emptyLabel={
                                    topSellingItems.length > 0
                                        ? 'No sales mix available.'
                                        : 'No POS sales yet.'
                                }
                            />
                        </section>
                    </div>
                </section>
            </main>
        </>
    );
}
