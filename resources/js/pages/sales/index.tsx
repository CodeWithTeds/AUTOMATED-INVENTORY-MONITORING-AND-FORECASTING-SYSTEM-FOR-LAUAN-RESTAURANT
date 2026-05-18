import { Head, router } from '@inertiajs/react';
import { TrendingUp, Filter, RotateCcw, Search, BarChart3, Receipt, Wallet } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import { 
    XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    Cell, AreaChart, Area, BarChart, Bar
} from 'recharts';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';

type Props = {
    sales: any;
    summary: {
        total_sales: number;
        total_orders: number;
        average_order_value: number;
    };
    charts: {
        sales_over_time: Array<{ date: string; total: number; count: number }>;
        sales_by_payment_method: Array<{ method: string; total: number; count: number }>;
    };
    filters: {
        start_date: string;
        end_date: string;
        payment_method?: string;
        search?: string;
    };
};

const LollipopBar = (props: any) => {
    const { fill, x, y, width, height } = props;
    const cy = y + height / 2;
    const circleRadius = 6;

    return (
        <g>
            {/* The Lollipop Stick */}
            <line x1={x} y1={cy} x2={x + width} y2={cy} stroke={fill} strokeWidth={2.5} />
            {/* The Lollipop Candy Head */}
            <circle cx={x + width} cy={cy} r={circleRadius} fill={fill} stroke="#ffffff" strokeWidth={1.5} />
        </g>
    );
};

const COLORS = ['#2ec66d', '#faa340', '#8b5cf6', '#fb4856', '#0f62da'];

const breadcrumbs = [
    { title: 'Sales Dashboard', href: '/admin/sales' },
];

export default function SalesIndex({ summary, charts, filters }: Props) {
    const [values, setValues] = useState({
        search: filters.search ?? '',
        start_date: filters.start_date ?? '',
        end_date: filters.end_date ?? '',
        payment_method: filters.payment_method ?? '',
    });

    const applyFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/sales', values, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setValues({
            search: '',
            start_date: '',
            end_date: '',
            payment_method: '',
        });
        router.get('/admin/sales', {}, { preserveScroll: true, replace: true });
    };

    const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

    return (
        <>
            <Head title="Sales Dashboard" />

            <main className="min-h-screen p-4 text-[#040404] sm:p-5">
                {/* Header section */}
                <section className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-[#040404]/65">
                            <TrendingUp className="size-4 text-[#faa340]" />
                            Interactive sales performance, revenue and volume analytics
                        </div>
                        <h1 className="mt-0.5 text-xl font-semibold tracking-normal text-[#040404]">
                            Lauan Restaurant Sales Reports & Charts
                        </h1>
                    </div>
                </section>

                <div className="space-y-4">
                    {/* Filters */}
                    <form onSubmit={applyFilters} className="border-y border-[#040404]/15 py-2">
                        <div className="grid gap-2 lg:grid-cols-[minmax(220px,1.4fr)_minmax(140px,0.8fr)_minmax(140px,0.8fr)_minmax(150px,0.8fr)_auto_auto]">
                            <label className="relative">
                                <span className="sr-only">Search sales</span>
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#040404]/45" />
                                <Input
                                    value={values.search}
                                    onChange={(event) =>
                                        setValues((current) => ({ ...current, search: event.target.value }))
                                    }
                                    className="h-8 border-[#040404]/15 pl-9 text-xs text-[#040404] focus-visible:border-[#faa340] focus-visible:ring-[#faa340]/30"
                                    placeholder="Search order or customer text..."
                                    type="search"
                                />
                            </label>

                            <Input
                                value={values.start_date}
                                onChange={(event) =>
                                    setValues((current) => ({ ...current, start_date: event.target.value }))
                                }
                                type="date"
                                className="h-8 border-[#040404]/15 text-xs text-[#040404] focus-visible:border-[#faa340] focus-visible:ring-[#faa340]/30"
                            />

                            <Input
                                value={values.end_date}
                                onChange={(event) =>
                                    setValues((current) => ({ ...current, end_date: event.target.value }))
                                }
                                type="date"
                                className="h-8 border-[#040404]/15 text-xs text-[#040404] focus-visible:border-[#faa340] focus-visible:ring-[#faa340]/30"
                            />

                            <select
                                value={values.payment_method}
                                onChange={(event) =>
                                    setValues((current) => ({ ...current, payment_method: event.target.value }))
                                }
                                className="h-8 rounded-md border border-[#040404]/15 px-2 text-xs text-[#040404] shadow-xs outline-none focus:border-[#faa340] focus:ring-3 focus:ring-[#faa340]/30"
                                aria-label="Filter by payment method"
                            >
                                <option value="">All payment methods</option>
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="online">Online</option>
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

                    {/* Summary Cards */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex items-center gap-4 rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm">
                            <span className="grid size-12 shrink-0 place-items-center bg-[#2ec66d]/10 text-[#2ec66d] rounded-lg">
                                <Wallet className="size-6" />
                            </span>
                            <div>
                                <p className="text-xs font-medium text-[#040404]/60">Total Sales Revenue</p>
                                <h3 className="mt-0.5 text-2xl font-bold text-[#040404]">{money.format(summary.total_sales)}</h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm">
                            <span className="grid size-12 shrink-0 place-items-center bg-[#faa340]/10 text-[#faa340] rounded-lg">
                                <Receipt className="size-6" />
                            </span>
                            <div>
                                <p className="text-xs font-medium text-[#040404]/60">Total Completed Orders</p>
                                <h3 className="mt-0.5 text-2xl font-bold text-[#040404]">{summary.total_orders}</h3>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm">
                            <span className="grid size-12 shrink-0 place-items-center bg-[#8b5cf6]/10 text-[#8b5cf6] rounded-lg">
                                <BarChart3 className="size-6" />
                            </span>
                            <div>
                                <p className="text-xs font-medium text-[#040404]/60">Average Order Value</p>
                                <h3 className="mt-0.5 text-2xl font-bold text-[#040404]">{money.format(summary.average_order_value)}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Charts Grid */}
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Area Chart: Revenue Trend */}
                        <div className="rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm">
                            <div className="mb-4">
                                <h2 className="text-sm font-semibold text-[#040404]">Sales Revenue Trend</h2>
                                <p className="text-xs text-[#040404]/60">Daily total revenue trajectory</p>
                            </div>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={charts.sales_over_time} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2ec66d" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#2ec66d" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `₱${value}`} width={60} />
                                        <RechartsTooltip formatter={(value: any) => money.format(Number(value))} labelStyle={{ color: '#040404' }} />
                                        <Area type="monotone" dataKey="total" stroke="#2ec66d" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTotal)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Bar Chart: Daily Completed Order Volumes */}
                        <div className="rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm">
                            <div className="mb-4">
                                <h2 className="text-sm font-semibold text-[#040404]">Daily Completed Order Volumes</h2>
                                <p className="text-xs text-[#040404]/60">Total transaction count per calendar day</p>
                            </div>
                            <div className="h-[280px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={charts.sales_over_time} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} ord`} width={50} />
                                        <RechartsTooltip formatter={(value: any) => [`${value} Orders`, 'Volume']} labelStyle={{ color: '#040404' }} />
                                        <Bar dataKey="count" fill="#faa340" radius={[4, 4, 0, 0]} maxBarSize={45} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    <section className="rounded-xl border border-[#040404]/10 bg-white p-4 shadow-sm">
                        <div className="mb-4">
                            <h2 className="text-sm font-semibold text-[#040404]">Revenue Share by Payment Method</h2>
                            <p className="text-xs text-[#040404]/60">Aggregate totals for each payment gateway</p>
                        </div>
                        <div className="h-[200px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={charts.sales_by_payment_method} margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                    <XAxis type="number" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `₱${value}`} />
                                    <YAxis dataKey="method" type="category" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} width={60} className="capitalize" />
                                    <RechartsTooltip formatter={(value: any) => money.format(Number(value))} labelStyle={{ color: '#040404' }} />
                                    <Bar dataKey="total" shape={<LollipopBar />} minPointSize={5}>
                                        {charts.sales_by_payment_method.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

SalesIndex.layout = (page: ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
