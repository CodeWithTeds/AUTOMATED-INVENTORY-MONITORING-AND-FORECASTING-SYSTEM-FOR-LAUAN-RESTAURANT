import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    ClipboardList,
    Filter,
    PackageSearch,
    ReceiptText,
    RotateCcw,
    ShoppingBag,
    TrendingUp,
    Truck,
    Utensils,
    Warehouse,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

type ReportFilters = {
    start_date: string;
    end_date: string;
    focus: string;
};

type ExecutiveCard = {
    label: string;
    value: number;
    helper: string;
    tone: string;
    format: 'currency' | 'number';
};

type Props = {
    filters: ReportFilters;
    cards: ExecutiveCard[];
    summary: {
        sales: {
            total_sales: number;
            total_orders: number;
            average_order_value: number;
        };
        inventory: {
            total_items: number;
            low_stock_items: number;
            watchlist_items: number;
            menu_items: number;
            inventory_value: number;
        };
        production: {
            planned_batches: number;
            active_batches: number;
            completed_batches: number;
            completed_quantity: number;
            waste_quantity: number;
        };
        procurement: {
            open_orders: number;
            received_orders: number;
            cancelled_orders: number;
            purchase_value: number;
            expected_this_week: number;
        };
        suppliers: {
            total_suppliers: number;
            active_suppliers: number;
            preferred_suppliers: number;
            watchlist_suppliers: number;
            average_rating: number;
        };
    };
    charts: {
        sales_trend: Array<{ date: string; total: number; orders: number }>;
        payment_methods: Array<{
            method: string;
            total: number;
            orders: number;
        }>;
        top_selling_items: Array<{
            name: string;
            quantity: number;
            total: number;
        }>;
        inventory_value_by_category: Array<{
            category: string;
            value: number;
            items: number;
        }>;
        production_statuses: Array<{ status: string; count: number }>;
        procurement_statuses: Array<{
            status: string;
            count: number;
            total: number;
        }>;
    };
    risk_items: Array<{
        name: string;
        sku: string;
        category: string;
        current_stock: number;
        reorder_point: number;
        unit: string;
        expiration_date: string | null;
    }>;
};

const breadcrumbs = [
    {
        title: 'Reports',
        href: '/admin/report',
    },
];

const chartColors = [
    '#2ec66d',
    '#faa340',
    '#0f62da',
    '#fb4856',
    '#8b5cf6',
    '#14b8a6',
];

const toneStyles: Record<string, string> = {
    green: 'border-[#2ec66d]/20 bg-[#2ec66d]/10 text-[#2ec66d]',
    amber: 'border-[#faa340]/25 bg-[#faa340]/10 text-[#faa340]',
    blue: 'border-[#0f62da]/20 bg-[#0f62da]/10 text-[#0f62da]',
    red: 'border-[#fb4856]/20 bg-[#fb4856]/10 text-[#fb4856]',
};

const focusCopy: Record<string, string> = {
    overview:
        'Full operating picture across sales, inventory, production and procurement.',
    sales: 'Revenue, transaction volume, payment mix and top-selling item performance.',
    inventory:
        'Current stock value, reorder risk, watchlist counts and category exposure.',
    production:
        'Batch throughput, active production work and waste signal monitoring.',
    procurement:
        'Purchase order exposure, supplier readiness and inbound order status.',
};

function formatCompactNumber(value: number) {
    return new Intl.NumberFormat('en-PH', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
}

export default function ReportsIndex({
    filters,
    cards,
    summary,
    charts,
    risk_items,
}: Props) {
    const [values, setValues] = useState<ReportFilters>({
        start_date: filters.start_date ?? '',
        end_date: filters.end_date ?? '',
        focus: filters.focus ?? 'overview',
    });

    const money = new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 0,
    });

    const number = new Intl.NumberFormat('en-PH', {
        maximumFractionDigits: 2,
    });

    const applyFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/report', values, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        const nextValues = {
            start_date: '',
            end_date: '',
            focus: 'overview',
        };

        setValues(nextValues);
        router.get('/admin/report', nextValues, {
            preserveScroll: true,
            replace: true,
        });
    };

    const formatCardValue = (card: ExecutiveCard) =>
        card.format === 'currency'
            ? money.format(card.value)
            : number.format(card.value);
    const maxProductionStatusCount = Math.max(
        ...charts.production_statuses.map((status) => status.count),
        1,
    );
    const maxProcurementStatusCount = Math.max(
        ...charts.procurement_statuses.map((status) => status.count),
        1,
    );

    const snapshotMetrics: Array<{
        label: string;
        value: string | number;
        icon: LucideIcon;
    }> = [
        {
            label: 'Average order value',
            value: money.format(summary.sales.average_order_value),
            icon: TrendingUp,
        },
        {
            label: 'Low-stock items',
            value: summary.inventory.low_stock_items,
            icon: AlertTriangle,
        },
        {
            label: 'Active production',
            value: summary.production.active_batches,
            icon: Utensils,
        },
        {
            label: 'Expected this week',
            value: summary.procurement.expected_this_week,
            icon: Truck,
        },
        {
            label: 'Preferred suppliers',
            value: summary.suppliers.preferred_suppliers,
            icon: Truck,
        },
        {
            label: 'Supplier rating',
            value: number.format(summary.suppliers.average_rating),
            icon: BarChart3,
        },
    ];

    return (
        <>
            <Head title="Reports" />

            <main className="min-h-screen p-4 text-[#040404] sm:p-5">
                <section className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-[#040404]/65">
                            <ClipboardList className="size-4 text-[#faa340]" />
                            Reports command center for Lauan Restaurant
                            operations
                        </div>
                        <h1 className="mt-0.5 text-xl font-semibold tracking-normal text-[#040404]">
                            Admin Reports & Performance Analytics
                        </h1>
                        <p className="mt-1 text-xs text-[#040404]/60">
                            {focusCopy[values.focus] ?? focusCopy.overview}
                        </p>
                    </div>
                </section>

                <div className="space-y-4">
                    <form
                        onSubmit={applyFilters}
                        className="border-y border-[#040404]/15 py-2"
                    >
                        <div className="grid gap-2 lg:grid-cols-[minmax(150px,0.8fr)_minmax(150px,0.8fr)_minmax(190px,1fr)_auto_auto]">
                            <Input
                                value={values.start_date}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        start_date: event.target.value,
                                    }))
                                }
                                type="date"
                                className="h-8 border-[#040404]/15 text-xs text-[#040404] focus-visible:border-[#faa340] focus-visible:ring-[#faa340]/30"
                            />

                            <Input
                                value={values.end_date}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        end_date: event.target.value,
                                    }))
                                }
                                type="date"
                                className="h-8 border-[#040404]/15 text-xs text-[#040404] focus-visible:border-[#faa340] focus-visible:ring-[#faa340]/30"
                            />

                            <select
                                value={values.focus}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        focus: event.target.value,
                                    }))
                                }
                                className="h-8 rounded-md border border-[#040404]/15 px-2 text-xs text-[#040404] shadow-xs outline-none focus:border-[#faa340] focus:ring-3 focus:ring-[#faa340]/30"
                                aria-label="Report focus"
                            >
                                <option value="overview">
                                    Overview reports
                                </option>
                                <option value="sales">Sales reports</option>
                                <option value="inventory">
                                    Inventory reports
                                </option>
                                <option value="production">
                                    Production reports
                                </option>
                                <option value="procurement">
                                    Procurement reports
                                </option>
                            </select>

                            <button
                                type="submit"
                                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#040404] px-3 text-xs font-medium text-[#faa340] transition hover:text-[#040404]"
                            >
                                <Filter className="size-4" />
                                Filter
                            </button>

                            <button
                                type="button"
                                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#040404]/20 px-3 text-xs font-medium text-[#040404] transition hover:text-[#faa340]"
                                onClick={clearFilters}
                            >
                                <RotateCcw className="size-4" />
                                Reset
                            </button>
                        </div>
                    </form>

                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {cards.map((card, index) => {
                            const icons = [
                                TrendingUp,
                                Warehouse,
                                Utensils,
                                ShoppingBag,
                            ];
                            const Icon = icons[index] ?? BarChart3;

                            return (
                                <article
                                    key={card.label}
                                    className="rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <span
                                            className={`grid size-11 shrink-0 place-items-center rounded-lg border ${
                                                toneStyles[card.tone] ??
                                                toneStyles.amber
                                            }`}
                                        >
                                            <Icon className="size-5" />
                                        </span>
                                        <span className="rounded-full bg-[#040404]/5 px-2 py-1 text-[11px] font-semibold text-[#040404]/60">
                                            Report
                                        </span>
                                    </div>
                                    <p className="mt-4 text-xs font-medium text-[#040404]/60">
                                        {card.label}
                                    </p>
                                    <h2 className="mt-1 text-2xl font-bold text-[#040404]">
                                        {formatCardValue(card)}
                                    </h2>
                                    <p className="mt-1 text-xs text-[#040404]/55">
                                        {card.helper}
                                    </p>
                                </article>
                            );
                        })}
                    </section>

                    <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
                        <article className="rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-semibold text-[#040404]">
                                        Revenue Report Trend
                                    </h2>
                                    <p className="text-xs text-[#040404]/60">
                                        Daily POS revenue and completed order
                                        volume
                                    </p>
                                </div>
                                <span className="rounded-md bg-[#2ec66d]/10 px-2 py-1 text-xs font-semibold text-[#2ec66d]">
                                    {summary.sales.total_orders} orders
                                </span>
                            </div>

                            <div className="h-[310px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={charts.sales_trend}
                                        margin={{
                                            top: 8,
                                            right: 14,
                                            bottom: 4,
                                            left: 0,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="reportsRevenue"
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="5%"
                                                    stopColor="#2ec66d"
                                                    stopOpacity={0.3}
                                                />
                                                <stop
                                                    offset="95%"
                                                    stopColor="#2ec66d"
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
                                            dataKey="date"
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
                                            tickFormatter={(value: number) =>
                                                `PHP ${formatCompactNumber(value)}`
                                            }
                                            width={78}
                                        />
                                        <RechartsTooltip
                                            formatter={(
                                                value: unknown,
                                                name: unknown,
                                            ) => [
                                                name === 'total'
                                                    ? money.format(
                                                          Number(value),
                                                      )
                                                    : number.format(
                                                          Number(value),
                                                      ),
                                                name === 'total'
                                                    ? 'Revenue'
                                                    : 'Orders',
                                            ]}
                                            labelStyle={{ color: '#040404' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#2ec66d"
                                            strokeWidth={2.5}
                                            fill="url(#reportsRevenue)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </article>

                        <article className="rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm">
                            <div className="mb-4">
                                <h2 className="text-sm font-semibold text-[#040404]">
                                    Payment Method Report
                                </h2>
                                <p className="text-xs text-[#040404]/60">
                                    Revenue share by checkout method
                                </p>
                            </div>

                            <div className="h-[230px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={charts.payment_methods}
                                            dataKey="total"
                                            nameKey="method"
                                            innerRadius={55}
                                            outerRadius={86}
                                            paddingAngle={3}
                                        >
                                            {charts.payment_methods.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={entry.method}
                                                        fill={
                                                            chartColors[
                                                                index %
                                                                    chartColors.length
                                                            ]
                                                        }
                                                    />
                                                ),
                                            )}
                                        </Pie>
                                        <RechartsTooltip
                                            formatter={(value: unknown) =>
                                                money.format(Number(value))
                                            }
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="space-y-2">
                                {charts.payment_methods.map((method, index) => (
                                    <div
                                        key={method.method}
                                        className="flex items-center justify-between text-xs"
                                    >
                                        <span className="flex items-center gap-2 text-[#040404]/65">
                                            <span
                                                className="size-2.5 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        chartColors[
                                                            index %
                                                                chartColors.length
                                                        ],
                                                }}
                                            />
                                            {method.method}
                                        </span>
                                        <span className="font-semibold text-[#040404]">
                                            {money.format(method.total)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </section>

                    <section className="grid gap-4 xl:grid-cols-2">
                        <article className="rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-semibold text-[#040404]">
                                        Top-Selling Items Report
                                    </h2>
                                    <p className="text-xs text-[#040404]/60">
                                        Menu items ranked by total sales value
                                    </p>
                                </div>
                                <ReceiptText className="size-5 text-[#faa340]" />
                            </div>
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        layout="vertical"
                                        data={charts.top_selling_items}
                                        margin={{
                                            top: 6,
                                            right: 18,
                                            bottom: 6,
                                            left: 18,
                                        }}
                                    >
                                        <CartesianGrid
                                            stroke="#e5e7eb"
                                            strokeDasharray="3 3"
                                            horizontal={false}
                                        />
                                        <XAxis
                                            type="number"
                                            stroke="#888888"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value: number) =>
                                                formatCompactNumber(value)
                                            }
                                        />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            stroke="#888888"
                                            fontSize={11}
                                            tickLine={false}
                                            axisLine={false}
                                            width={92}
                                        />
                                        <RechartsTooltip
                                            formatter={(value: unknown) =>
                                                money.format(Number(value))
                                            }
                                        />
                                        <Bar
                                            dataKey="total"
                                            fill="#faa340"
                                            radius={[0, 6, 6, 0]}
                                            maxBarSize={24}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </article>

                        <article className="rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-semibold text-[#040404]">
                                        Inventory Value Report
                                    </h2>
                                    <p className="text-xs text-[#040404]/60">
                                        Current inventory value grouped by
                                        category
                                    </p>
                                </div>
                                <PackageSearch className="size-5 text-[#0f62da]" />
                            </div>
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={
                                            charts.inventory_value_by_category
                                        }
                                        margin={{
                                            top: 6,
                                            right: 10,
                                            bottom: 6,
                                            left: 0,
                                        }}
                                    >
                                        <CartesianGrid
                                            stroke="#e5e7eb"
                                            strokeDasharray="3 3"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="category"
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
                                            tickFormatter={(value: number) =>
                                                formatCompactNumber(value)
                                            }
                                            width={58}
                                        />
                                        <RechartsTooltip
                                            formatter={(value: unknown) =>
                                                money.format(Number(value))
                                            }
                                        />
                                        <Bar
                                            dataKey="value"
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={44}
                                        >
                                            {charts.inventory_value_by_category.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={entry.category}
                                                        fill={
                                                            chartColors[
                                                                index %
                                                                    chartColors.length
                                                            ]
                                                        }
                                                    />
                                                ),
                                            )}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </article>
                    </section>

                    <section className="grid gap-4 xl:grid-cols-2">
                        <article className="rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-semibold text-[#040404]">
                                        Production Status Report
                                    </h2>
                                    <p className="text-xs text-[#040404]/60">
                                        Batch workload grouped by current
                                        production state
                                    </p>
                                </div>
                                <Utensils className="size-5 text-[#0f62da]" />
                            </div>

                            <div className="space-y-3">
                                {charts.production_statuses.length > 0 ? (
                                    charts.production_statuses.map(
                                        (status, index) => (
                                            <div
                                                key={status.status}
                                                className="space-y-1"
                                            >
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-medium text-[#040404]/70">
                                                        {status.status}
                                                    </span>
                                                    <span className="font-semibold text-[#040404]">
                                                        {status.count} batches
                                                    </span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-[#040404]/10">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${(status.count / maxProductionStatusCount) * 100}%`,
                                                            backgroundColor:
                                                                chartColors[
                                                                    index %
                                                                        chartColors.length
                                                                ],
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <p className="rounded-lg border border-dashed border-[#040404]/15 p-4 text-center text-xs text-[#040404]/55">
                                        No production batches found for this
                                        report period.
                                    </p>
                                )}
                            </div>
                        </article>

                        <article className="rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-semibold text-[#040404]">
                                        Procurement Status Report
                                    </h2>
                                    <p className="text-xs text-[#040404]/60">
                                        Purchase order count and amount by
                                        lifecycle state
                                    </p>
                                </div>
                                <ShoppingBag className="size-5 text-[#faa340]" />
                            </div>

                            <div className="space-y-3">
                                {charts.procurement_statuses.length > 0 ? (
                                    charts.procurement_statuses.map(
                                        (status, index) => (
                                            <div
                                                key={status.status}
                                                className="space-y-1"
                                            >
                                                <div className="flex items-center justify-between gap-3 text-xs">
                                                    <span className="font-medium text-[#040404]/70">
                                                        {status.status}
                                                    </span>
                                                    <span className="text-right font-semibold text-[#040404]">
                                                        {status.count} orders ·{' '}
                                                        {money.format(
                                                            status.total,
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="h-2 overflow-hidden rounded-full bg-[#040404]/10">
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{
                                                            width: `${(status.count / maxProcurementStatusCount) * 100}%`,
                                                            backgroundColor:
                                                                chartColors[
                                                                    index %
                                                                        chartColors.length
                                                                ],
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <p className="rounded-lg border border-dashed border-[#040404]/15 p-4 text-center text-xs text-[#040404]/55">
                                        No purchase orders found for this report
                                        period.
                                    </p>
                                )}
                            </div>
                        </article>
                    </section>

                    <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
                        <article className="rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm">
                            <div className="mb-4">
                                <h2 className="text-sm font-semibold text-[#040404]">
                                    Operations Report Snapshot
                                </h2>
                                <p className="text-xs text-[#040404]/60">
                                    Fast health checks for production,
                                    procurement and suppliers
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                {snapshotMetrics.map((metric) => (
                                    <div
                                        key={metric.label}
                                        className="rounded-lg border border-[#040404]/10 p-3"
                                    >
                                        <div className="flex items-center gap-2 text-xs text-[#040404]/55">
                                            <metric.icon className="size-4 text-[#faa340]" />
                                            {metric.label}
                                        </div>
                                        <p className="mt-2 text-lg font-bold text-[#040404]">
                                            {metric.value}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </article>

                        <article className="rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-semibold text-[#040404]">
                                        Stock Risk Report
                                    </h2>
                                    <p className="text-xs text-[#040404]/60">
                                        Items below reorder point or nearing
                                        expiration
                                    </p>
                                </div>
                                <AlertTriangle className="size-5 text-[#fb4856]" />
                            </div>

                            <div className="overflow-hidden rounded-lg border border-[#040404]/10">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-[#040404]/5 text-[#040404]/60">
                                        <tr>
                                            <th className="px-3 py-2 font-semibold">
                                                Item
                                            </th>
                                            <th className="px-3 py-2 font-semibold">
                                                Category
                                            </th>
                                            <th className="px-3 py-2 font-semibold">
                                                Stock
                                            </th>
                                            <th className="px-3 py-2 font-semibold">
                                                Expiry
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#040404]/10 bg-white">
                                        {risk_items.length > 0 ? (
                                            risk_items.map((item) => (
                                                <tr key={item.sku}>
                                                    <td className="px-3 py-3">
                                                        <div className="font-semibold text-[#040404]">
                                                            {item.name}
                                                        </div>
                                                        <div className="text-[#040404]/50">
                                                            {item.sku}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-[#040404]/65">
                                                        {item.category}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <span className="font-semibold text-[#fb4856]">
                                                            {number.format(
                                                                item.current_stock,
                                                            )}
                                                        </span>
                                                        <span className="text-[#040404]/50">
                                                            {' '}
                                                            /{' '}
                                                            {
                                                                item.reorder_point
                                                            }{' '}
                                                            {item.unit}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 text-[#040404]/65">
                                                        {item.expiration_date ??
                                                            'No expiry'}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    className="px-3 py-6 text-center text-[#040404]/55"
                                                    colSpan={4}
                                                >
                                                    No stock risks found for the
                                                    current inventory snapshot.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </article>
                    </section>
                </div>
            </main>
        </>
    );
}

ReportsIndex.layout = (page: ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
