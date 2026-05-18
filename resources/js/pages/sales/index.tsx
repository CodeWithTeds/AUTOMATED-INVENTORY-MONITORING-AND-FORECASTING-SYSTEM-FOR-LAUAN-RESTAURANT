import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';

type Props = {
    sales: any;
    summary: {
        total_sales: number;
        total_orders: number;
        average_order_value: number;
    };
    charts: {
        sales_over_time: Array<{ date: string; total: number }>;
        sales_by_payment_method: Array<{ method: string; total: number; count: number }>;
    };
    filters: {
        start_date: string;
        end_date: string;
        payment_method?: string;
        search?: string;
    };
};

const COLORS = ['#2ec66d', '#faa340', '#8b5cf6', '#fb4856', '#0f62da'];

const breadcrumbs = [
    { title: 'Sales Dashboard', href: '/admin/sales' },
];

export default function SalesIndex({ sales, summary, charts, filters }: Props) {
    const [startDate, setStartDate] = useState(filters.start_date || '');
    const [endDate, setEndDate] = useState(filters.end_date || '');
    const [paymentMethod, setPaymentMethod] = useState(filters.payment_method || 'all');
    const [search, setSearch] = useState(filters.search || '');

    const applyFilters = () => {
        router.get('/admin/sales', {
            start_date: startDate,
            end_date: endDate,
            ...(paymentMethod !== 'all' ? { payment_method: paymentMethod } : {}),
            ...(search ? { search } : {}),
        }, { preserveState: true });
    };

    const money = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Sales Dashboard</h2>
                        <p className="text-muted-foreground">Monitor your sales performance and metrics.</p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <label className="text-sm font-medium">Search</label>
                                <Input 
                                    placeholder="Search by Order No or Customer" 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="grid w-full max-w-[200px] items-center gap-1.5">
                                <label className="text-sm font-medium">Start Date</label>
                                <Input 
                                    type="date" 
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div className="grid w-full max-w-[200px] items-center gap-1.5">
                                <label className="text-sm font-medium">End Date</label>
                                <Input 
                                    type="date" 
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <div className="grid w-full max-w-[200px] items-center gap-1.5">
                                <label className="text-sm font-medium">Payment Method</label>
                                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Methods" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Methods</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="card">Card</SelectItem>
                                        <SelectItem value="online">Online</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button onClick={applyFilters} className="bg-[#2ec66d] text-white hover:bg-[#27b765]">
                                Apply Filters
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Summary Metrics */}
                <div className="grid gap-6 sm:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{money.format(summary.total_sales)}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_orders}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{money.format(summary.average_order_value)}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sales Over Time</CardTitle>
                            <CardDescription>Daily sales total for the selected period.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-0">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={charts.sales_over_time} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₱${value}`} />
                                        <RechartsTooltip formatter={(value: number) => money.format(value)} labelStyle={{ color: '#040404' }} />
                                        <Line type="monotone" dataKey="total" stroke="#2ec66d" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Sales by Payment Method</CardTitle>
                            <CardDescription>Breakdown of sales total by payment method.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={charts.sales_by_payment_method}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="total"
                                            nameKey="method"
                                        >
                                            {charts.sales_by_payment_method.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip formatter={(value: number) => money.format(value)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sales Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                        <CardDescription>A list of completed sales matching the filters.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="border-b text-muted-foreground">
                                    <tr>
                                        <th className="pb-3 font-medium">Order Number</th>
                                        <th className="pb-3 font-medium">Date</th>
                                        <th className="pb-3 font-medium">Customer</th>
                                        <th className="pb-3 font-medium">Payment Method</th>
                                        <th className="pb-3 font-medium text-right">Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sales.data.map((order: any) => (
                                        <tr key={order.id} className="border-b last:border-0 hover:bg-muted/50">
                                            <td className="py-3 font-medium">{order.order_number}</td>
                                            <td className="py-3">{order.paid_at}</td>
                                            <td className="py-3">{order.customer_name || 'Walk-in'}</td>
                                            <td className="py-3 capitalize">{order.payment_method}</td>
                                            <td className="py-3 text-right">{money.format(order.total_amount)}</td>
                                        </tr>
                                    ))}
                                    {sales.data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-6 text-center text-muted-foreground">
                                                No sales found for the selected filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
