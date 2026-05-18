import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    BarChart3,
    Boxes,
    CalendarDays,
    Filter,
    PackagePlus,
    RotateCcw,
    Sparkles,
    TrendingUp,
    Wallet,
} from 'lucide-react';
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

type ForecastingFilters = {
    start_date: string;
    end_date: string;
    horizon_days: number;
    category: string;
    risk: string;
};

type ForecastItem = {
    id: number;
    sku: string;
    name: string;
    category: string;
    unit: string;
    current_stock: number;
    reorder_point: number;
    sold_quantity: number;
    sales_revenue: number;
    average_daily_demand: number;
    recent_daily_demand: number;
    forecast_quantity: number;
    forecast_revenue: number;
    days_of_cover: number | null;
    suggested_restock_quantity: number;
    trend_percent: number;
    confidence: 'high' | 'medium' | 'low';
    risk_level: 'critical' | 'watch' | 'stable';
};

type Props = {
    filters: ForecastingFilters;
    summary: {
        total_forecast_units: number;
        forecast_revenue: number;
        critical_items: number;
        watch_items: number;
        restock_units: number;
        tracked_items: number;
    };
    items: ForecastItem[];
    charts: {
        demand_trend: Array<{
            date: string;
            quantity: number;
            revenue: number;
        }>;
        category_demand: Array<{
            category: string;
            quantity: number;
            revenue: number;
        }>;
        risk_mix: Array<{ risk: string; count: number }>;
    };
    categoryOptions: Array<{ label: string; value: string }>;
};

const breadcrumbs = [
    {
        title: 'Forecasting',
        href: '/admin/forcasting',
    },
];

const chartColors = ['#2ec66d', '#faa340', '#0f62da', '#fb4856', '#8b5cf6'];

const riskStyles: Record<ForecastItem['risk_level'], string> = {
    critical: 'border-[#fb4856]/30 bg-[#fb4856]/10 text-[#fb4856]',
    watch: 'border-[#faa340]/30 bg-[#faa340]/10 text-[#b76a00]',
    stable: 'border-[#2ec66d]/30 bg-[#2ec66d]/10 text-[#14843f]',
};

const confidenceStyles: Record<ForecastItem['confidence'], string> = {
    high: 'bg-[#2ec66d]/10 text-[#14843f]',
    medium: 'bg-[#faa340]/10 text-[#b76a00]',
    low: 'bg-[#040404]/5 text-[#040404]/55',
};

function compact(value: number) {
    return new Intl.NumberFormat('en-PH', {
        notation: 'compact',
        maximumFractionDigits: 1,
    }).format(value);
}

export default function ForecastingIndex({
    filters,
    summary,
    items,
    charts,
    categoryOptions,
}: Props) {
    const [values, setValues] = useState<ForecastingFilters>({
        start_date: filters.start_date ?? '',
        end_date: filters.end_date ?? '',
        horizon_days: filters.horizon_days ?? 14,
        category: filters.category ?? '',
        risk: filters.risk ?? 'all',
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
        router.get('/admin/forcasting', values, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        const nextValues = {
            start_date: '',
            end_date: '',
            horizon_days: 14,
            category: '',
            risk: 'all',
        };

        setValues(nextValues);
        router.get('/admin/forcasting', nextValues, {
            preserveScroll: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Forecasting" />

            <main className="min-h-screen p-4 text-[#040404] sm:p-5">
                <section className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-[#040404]/65">
                            <Sparkles className="size-4 text-[#faa340]" />
                            POS-powered inventory forecasting and demand
                            planning
                        </div>
                        <h1 className="mt-0.5 text-xl font-semibold tracking-normal text-[#040404]">
                            Inventory Forecasting
                        </h1>
                        <p className="mt-1 max-w-3xl text-xs text-[#040404]/60">
                            Uses historical POS item sales, recent demand
                            trends, current stock, reorder points and lead times
                            to predict demand for the next {values.horizon_days}{' '}
                            days.
                        </p>
                    </div>
                </section>

                <div className="space-y-4">
                    <form
                        onSubmit={applyFilters}
                        className="border-y border-[#040404]/15 py-2"
                    >
                        <div className="grid gap-2 xl:grid-cols-[minmax(135px,0.7fr)_minmax(135px,0.7fr)_minmax(135px,0.65fr)_minmax(170px,0.8fr)_minmax(145px,0.7fr)_auto_auto]">
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
                                value={values.horizon_days}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        horizon_days: Number(
                                            event.target.value,
                                        ),
                                    }))
                                }
                                className="h-8 rounded-md border border-[#040404]/15 px-2 text-xs text-[#040404] shadow-xs outline-none focus:border-[#faa340] focus:ring-3 focus:ring-[#faa340]/30"
                                aria-label="Forecast horizon"
                            >
                                <option value={7}>Next 7 days</option>
                                <option value={14}>Next 14 days</option>
                                <option value={30}>Next 30 days</option>
                                <option value={60}>Next 60 days</option>
                            </select>

                            <select
                                value={values.category}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        category: event.target.value,
                                    }))
                                }
                                className="h-8 rounded-md border border-[#040404]/15 px-2 text-xs text-[#040404] shadow-xs outline-none focus:border-[#faa340] focus:ring-3 focus:ring-[#faa340]/30"
                                aria-label="Filter by category"
                            >
                                <option value="">All categories</option>
                                {categoryOptions.map((category) => (
                                    <option
                                        key={category.value}
                                        value={category.value}
                                    >
                                        {category.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={values.risk}
                                onChange={(event) =>
                                    setValues((current) => ({
                                        ...current,
                                        risk: event.target.value,
                                    }))
                                }
                                className="h-8 rounded-md border border-[#040404]/15 px-2 text-xs text-[#040404] shadow-xs outline-none focus:border-[#faa340] focus:ring-3 focus:ring-[#faa340]/30"
                                aria-label="Filter by risk"
                            >
                                <option value="all">All risk levels</option>
                                <option value="critical">Critical only</option>
                                <option value="watch">Watch only</option>
                                <option value="stable">Stable only</option>
                            </select>

                            <button
                                type="submit"
                                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#040404] px-3 text-xs font-medium text-[#faa340] transition hover:text-[#040404]"
                            >
                                <Filter className="size-4" />
                                Forecast
                            </button>

                            <button
                                type="button"
                                onClick={clearFilters}
                                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#040404]/20 px-3 text-xs font-medium text-[#040404] transition hover:text-[#faa340]"
                            >
                                <RotateCcw className="size-4" />
                                Reset
                            </button>
                        </div>
                    </form>

                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {[
                            {
                                label: 'Forecast Demand',
                                value: number.format(
                                    summary.total_forecast_units,
                                ),
                                helper: `${summary.tracked_items} menu items tracked`,
                                icon: TrendingUp,
                                tone: 'bg-[#2ec66d]/10 text-[#2ec66d]',
                            },
                            {
                                label: 'Forecast Revenue',
                                value: money.format(summary.forecast_revenue),
                                helper: `Projected POS value`,
                                icon: Wallet,
                                tone: 'bg-[#faa340]/10 text-[#faa340]',
                            },
                            {
                                label: 'Critical Stockouts',
                                value: number.format(summary.critical_items),
                                helper: `${summary.watch_items} more on watch`,
                                icon: AlertTriangle,
                                tone: 'bg-[#fb4856]/10 text-[#fb4856]',
                            },
                            {
                                label: 'Suggested Restock',
                                value: number.format(summary.restock_units),
                                helper: `Units to cover forecast`,
                                icon: PackagePlus,
                                tone: 'bg-[#0f62da]/10 text-[#0f62da]',
                            },
                        ].map((card) => (
                            <article
                                key={card.label}
                                className="rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm"
                            >
                                <span
                                    className={`grid size-11 place-items-center rounded-lg ${card.tone}`}
                                >
                                    <card.icon className="size-5" />
                                </span>
                                <p className="mt-4 text-xs font-medium text-[#040404]/60">
                                    {card.label}
                                </p>
                                <h2 className="mt-1 text-2xl font-bold text-[#040404]">
                                    {card.value}
                                </h2>
                                <p className="mt-1 text-xs text-[#040404]/55">
                                    {card.helper}
                                </p>
                            </article>
                        ))}
                    </section>

                    <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
                        <article className="rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm">
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-semibold text-[#040404]">
                                        Historical POS Demand Trend
                                    </h2>
                                    <p className="text-xs text-[#040404]/60">
                                        Daily sold quantity from paid POS orders
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1 rounded-md bg-[#040404]/5 px-2 py-1 text-xs font-semibold text-[#040404]/60">
                                    <CalendarDays className="size-3.5" />
                                    {filters.start_date} to {filters.end_date}
                                </span>
                            </div>

                            <div className="h-[310px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={charts.demand_trend}
                                        margin={{
                                            top: 8,
                                            right: 14,
                                            bottom: 4,
                                            left: 0,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient
                                                id="forecastDemand"
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
                                                compact(value)
                                            }
                                            width={54}
                                        />
                                        <RechartsTooltip
                                            formatter={(
                                                value: unknown,
                                                name: unknown,
                                            ) => [
                                                name === 'quantity'
                                                    ? `${number.format(Number(value))} units`
                                                    : money.format(
                                                          Number(value),
                                                      ),
                                                name === 'quantity'
                                                    ? 'Demand'
                                                    : 'Revenue',
                                            ]}
                                            labelStyle={{ color: '#040404' }}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="quantity"
                                            stroke="#2ec66d"
                                            strokeWidth={2.5}
                                            fill="url(#forecastDemand)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </article>

                        <article className="rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm">
                            <div className="mb-4">
                                <h2 className="text-sm font-semibold text-[#040404]">
                                    Forecast Risk Mix
                                </h2>
                                <p className="text-xs text-[#040404]/60">
                                    Stockout risk from projected demand versus
                                    current stock
                                </p>
                            </div>
                            <div className="h-[230px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={charts.risk_mix}
                                            dataKey="count"
                                            nameKey="risk"
                                            innerRadius={55}
                                            outerRadius={86}
                                            paddingAngle={3}
                                        >
                                            {charts.risk_mix.map(
                                                (entry, index) => (
                                                    <Cell
                                                        key={entry.risk}
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
                                                `${number.format(Number(value))} items`
                                            }
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-2">
                                {charts.risk_mix.map((risk, index) => (
                                    <div
                                        key={risk.risk}
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
                                            {risk.risk}
                                        </span>
                                        <span className="font-semibold text-[#040404]">
                                            {risk.count}
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
                                        Category Demand
                                    </h2>
                                    <p className="text-xs text-[#040404]/60">
                                        POS demand grouped by inventory category
                                    </p>
                                </div>
                                <BarChart3 className="size-5 text-[#faa340]" />
                            </div>
                            <div className="h-[260px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={charts.category_demand}
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
                                                compact(value)
                                            }
                                            width={54}
                                        />
                                        <RechartsTooltip
                                            formatter={(value: unknown) =>
                                                `${number.format(Number(value))} units`
                                            }
                                        />
                                        <Bar
                                            dataKey="quantity"
                                            radius={[6, 6, 0, 0]}
                                            maxBarSize={44}
                                        >
                                            {charts.category_demand.map(
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

                        <article className="rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm">
                            <div className="mb-4 flex items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-sm font-semibold text-[#040404]">
                                        Forecasting Method
                                    </h2>
                                    <p className="text-xs text-[#040404]/60">
                                        How this module estimates future demand
                                    </p>
                                </div>
                                <Sparkles className="size-5 text-[#0f62da]" />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {[
                                    [
                                        'Historical baseline',
                                        'Average daily demand from the selected POS sales window.',
                                    ],
                                    [
                                        'Current trend',
                                        'Recent 7-day demand is blended into the forecast.',
                                    ],
                                    [
                                        'Stock cover',
                                        'Current stock is divided by weighted daily demand.',
                                    ],
                                    [
                                        'Restock advice',
                                        'Forecast demand plus reorder buffer minus stock on hand.',
                                    ],
                                ].map(([label, copy]) => (
                                    <div
                                        key={label}
                                        className="rounded-lg border border-[#040404]/10 p-3"
                                    >
                                        <p className="text-xs font-semibold text-[#040404]">
                                            {label}
                                        </p>
                                        <p className="mt-1 text-xs leading-5 text-[#040404]/58">
                                            {copy}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </article>
                    </section>

                    <section className="rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold text-[#040404]">
                                    Item Forecast Table
                                </h2>
                                <p className="text-xs text-[#040404]/60">
                                    Product-level demand, cover days and
                                    suggested production/restock quantity
                                </p>
                            </div>
                            <Boxes className="size-5 text-[#faa340]" />
                        </div>

                        <div className="overflow-hidden rounded-lg border border-[#040404]/10">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-[#040404]/5 text-[#040404]/60">
                                    <tr>
                                        <th className="px-3 py-2 font-semibold">
                                            Item
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Historical Sales
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Forecast
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Current Stock
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Cover
                                        </th>
                                        <th className="px-3 py-2 font-semibold">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#040404]/10 bg-white">
                                    {items.length > 0 ? (
                                        items.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-3 py-3">
                                                    <div className="font-semibold text-[#040404]">
                                                        {item.name}
                                                    </div>
                                                    <div className="text-[#040404]/50">
                                                        {item.sku} ·{' '}
                                                        {item.category}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="font-semibold text-[#040404]">
                                                        {number.format(
                                                            item.sold_quantity,
                                                        )}{' '}
                                                        {item.unit}
                                                    </div>
                                                    <div className="text-[#040404]/50">
                                                        {money.format(
                                                            item.sales_revenue,
                                                        )}{' '}
                                                        revenue
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="font-semibold text-[#040404]">
                                                        {number.format(
                                                            item.forecast_quantity,
                                                        )}{' '}
                                                        {item.unit}
                                                    </div>
                                                    <div
                                                        className={
                                                            item.trend_percent >=
                                                            0
                                                                ? 'text-[#2ec66d]'
                                                                : 'text-[#fb4856]'
                                                        }
                                                    >
                                                        {item.trend_percent >= 0
                                                            ? '+'
                                                            : ''}
                                                        {number.format(
                                                            item.trend_percent,
                                                        )}
                                                        % recent trend
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 font-semibold text-[#040404]">
                                                    {number.format(
                                                        item.current_stock,
                                                    )}{' '}
                                                    {item.unit}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="font-semibold text-[#040404]">
                                                        {item.days_of_cover ===
                                                        null
                                                            ? 'No demand'
                                                            : `${number.format(item.days_of_cover)} days`}
                                                    </div>
                                                    <span
                                                        className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${confidenceStyles[item.confidence]}`}
                                                    >
                                                        {item.confidence}{' '}
                                                        confidence
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span
                                                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${riskStyles[item.risk_level]}`}
                                                    >
                                                        {item.risk_level}
                                                    </span>
                                                    <div className="mt-1 text-[#040404]/55">
                                                        Restock{' '}
                                                        <span className="font-semibold text-[#040404]">
                                                            {number.format(
                                                                item.suggested_restock_quantity,
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                className="px-3 py-8 text-center text-[#040404]/55"
                                                colSpan={6}
                                            >
                                                No POS demand found for the
                                                selected forecasting filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

ForecastingIndex.layout = (page: ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
