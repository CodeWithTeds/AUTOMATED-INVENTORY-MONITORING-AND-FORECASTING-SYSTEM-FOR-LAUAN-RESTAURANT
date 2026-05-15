import { Head, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    Bell,
    CalendarDays,
    Mail,
    Package,
    Plus,
    Search,
    Store,
    TrendingUp,
} from 'lucide-react';
import { dashboard } from '@/routes';

const stats = [
    { label: 'Low Stock', value: '5,468', delta: '+19.01%', bars: [48, 72, 36, 88, 61, 76] },
    { label: 'Critical Items', value: '4,598', delta: '+12.40%', bars: [35, 62, 45, 76, 52, 91] },
    { label: 'Total Inventory', value: '3,698', delta: '+8.22%', bars: [56, 70, 66, 74, 69, 58] },
    { label: 'Total Earnings', value: '$89,878.58', delta: '+21.11%', bars: [44, 78, 54, 89, 66, 50] },
];

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const purchases = [53, 37, 23, 53, 42, 53, 23, 29, 53, 33, 45, 31];
const sales = [14, 23, 9, 14, 26, 14, 9, 16, 42, 5, 29, 14];

export default function Dashboard() {
    const { auth } = usePage().props;
    const firstName = auth.user?.name?.split(' ')[0] ?? 'Renz';

    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="min-h-screen bg-[#f4f1ed] text-[#040404]">
                <header className="sticky top-0 z-20 border-b border-[#040404]/8 bg-white/88 px-4 py-4 backdrop-blur md:px-6">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
                            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#040404]/35" />
                            <input
                                type="search"
                                placeholder="Search"
                                className="h-11 w-full rounded-md border border-[#040404]/10 bg-[#fbf8f5] px-10 text-sm outline-none transition placeholder:text-[#040404]/38 focus:border-[#faa340] focus:ring-4 focus:ring-[#faa340]/16"
                            />
                        </div>

                        <button className="inline-flex h-11 items-center gap-2 rounded-md border border-[#040404]/10 bg-white px-4 text-sm font-medium">
                            <Store className="size-4 text-[#faa340]" />
                            Freshmart
                        </button>
                        <button className="inline-flex h-11 items-center gap-2 rounded-md bg-[#faa340] px-4 text-sm font-semibold text-[#040404] shadow-[0_12px_28px_rgba(250,163,64,0.26)]">
                            <Plus className="size-4" />
                            Add New
                        </button>
                        <button className="inline-flex h-11 items-center rounded-md bg-[#040404] px-4 text-sm font-semibold text-white">
                            POS
                        </button>
                        <button className="relative inline-flex size-11 items-center justify-center rounded-md bg-[#fbf8f5]">
                            <Mail className="size-5 text-[#040404]/62" />
                            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#faa340]" />
                        </button>
                        <button className="inline-flex size-11 items-center justify-center rounded-md bg-[#fbf8f5]">
                            <Bell className="size-5 text-[#040404]/62" />
                        </button>
                    </div>
                </header>

                <main className="space-y-6 p-4 md:p-6">
                    <section className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                        <div>
                            <h1 className="text-4xl font-semibold leading-tight">
                                Welcome, {firstName}
                            </h1>
                            <p className="mt-2 text-[#040404]/58">
                                You have <span className="font-semibold text-[#faa340]">200+</span>{' '}
                                Orders, Today
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <article className="rounded-lg border border-[#040404]/10 bg-white p-5 shadow-[0_18px_44px_rgba(4,4,4,0.08)]">
                                <div className="flex gap-4">
                                    <div className="flex size-12 items-center justify-center rounded-full border border-[#faa340]/35 bg-[#fff5e8]">
                                        <AlertTriangle className="size-6 text-[#faa340]" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            Out of Stock
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-[#040404]/58">
                                            Liempo Chips is currently out of stock.
                                            Immediate production or restocking is required.
                                        </p>
                                    </div>
                                </div>
                            </article>

                            <article className="rounded-lg border border-[#040404]/10 bg-white p-5 shadow-[0_18px_44px_rgba(4,4,4,0.08)]">
                                <div className="flex gap-4">
                                    <div className="flex size-12 items-center justify-center rounded-full border border-[#faa340]/35 bg-[#fff5e8]">
                                        <Package className="size-6 text-[#faa340]" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold">
                                            Low Stock Alert
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-[#040404]/58">
                                            Current stock: 4 packs. Estimated days
                                            left: 2. Produce or restock 46 packs.
                                        </p>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </section>

                    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {stats.map((stat) => (
                            <article
                                key={stat.label}
                                className="rounded-lg border border-[#040404]/10 bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex size-12 items-center justify-center rounded-md bg-[#040404]">
                                        <TrendingUp className="size-5 text-white" />
                                    </div>
                                    <span className="rounded-md bg-[#faa340]/16 px-2.5 py-1 text-xs font-semibold text-[#040404]">
                                        {stat.delta}
                                    </span>
                                </div>
                                <div className="mt-7 flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-3xl font-semibold">{stat.value}</p>
                                        <p className="mt-1 text-sm text-[#040404]/58">
                                            {stat.label}
                                        </p>
                                    </div>
                                    <div className="flex h-14 items-end gap-1.5">
                                        {stat.bars.map((height, index) => (
                                            <span
                                                key={`${stat.label}-${index}`}
                                                className="w-2 rounded-t-sm bg-[#faa340]"
                                                style={{ height: `${height}%` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>

                    <section className="grid gap-6 xl:grid-cols-[1fr_340px]">
                        <article className="rounded-lg border border-[#040404]/10 bg-white shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#040404]/8 p-5">
                                <h2 className="text-xl font-semibold">Sales & Purchase</h2>
                                <div className="flex overflow-hidden rounded-md border border-[#040404]/8 text-sm">
                                    {['1D', '1W', '1M', '3M', '6M', '1Y'].map((range) => (
                                        <button
                                            key={range}
                                            className={`h-10 px-4 ${
                                                range === '1Y'
                                                    ? 'bg-[#faa340] text-[#040404]'
                                                    : 'bg-[#fbf8f5] text-[#040404]/70'
                                            }`}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="mb-8 flex flex-wrap gap-3">
                                    <div className="rounded-md border border-[#040404]/10 px-4 py-3">
                                        <p className="text-sm text-[#040404]/56">
                                            Total Purchase
                                        </p>
                                        <p className="mt-1 text-2xl font-semibold">49K</p>
                                    </div>
                                    <div className="rounded-md border border-[#040404]/10 px-4 py-3">
                                        <p className="text-sm text-[#040404]/56">
                                            Total Sales
                                        </p>
                                        <p className="mt-1 text-2xl font-semibold">38K</p>
                                    </div>
                                </div>
                                <div className="flex min-h-72 gap-4">
                                    <div className="flex w-10 flex-col justify-between text-sm text-[#040404]/48">
                                        {['60K', '50K', '40K', '30K', '20K', '10K', '0'].map(
                                            (label) => (
                                                <span key={label}>{label}</span>
                                            ),
                                        )}
                                    </div>
                                    <div className="flex flex-1 items-end gap-3 overflow-x-auto">
                                        {months.map((month, index) => (
                                            <div
                                                key={month}
                                                className="flex min-w-12 flex-1 flex-col items-center gap-3"
                                            >
                                                <div className="flex h-60 w-full items-end rounded-t-lg bg-[#e3dad0]/72">
                                                    <span
                                                        className="w-full rounded-t-lg bg-[#faa340]"
                                                        style={{ height: `${sales[index]}%` }}
                                                    />
                                                    <span
                                                        className="hidden"
                                                        style={{
                                                            height: `${purchases[index]}%`,
                                                        }}
                                                    />
                                                </div>
                                                <span className="text-sm text-[#040404]/58">
                                                    {month}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </article>

                        <aside className="space-y-6">
                            <article className="rounded-lg border border-[#040404]/10 bg-white p-5 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">Production</h2>
                                    <button className="inline-flex h-10 items-center gap-2 rounded-md border border-[#040404]/10 px-3 text-sm font-medium">
                                        <CalendarDays className="size-4" />
                                        This Month
                                    </button>
                                </div>
                                <div className="mx-auto mt-8 grid size-44 place-items-center rounded-full bg-[conic-gradient(#faa340_0_60%,#040404_60%_80%,#e3dad0_80%_100%)]">
                                    <div className="grid size-20 place-items-center rounded-full bg-white text-sm font-semibold">
                                        60%
                                    </div>
                                </div>
                                <div className="mt-8 space-y-3 text-sm">
                                    {[
                                        ['Basic', '60%', '#faa340'],
                                        ['Premium', '20%', '#040404'],
                                        ['Enterprise', '20%', '#e3dad0'],
                                    ].map(([label, value, color]) => (
                                        <div
                                            key={label}
                                            className="flex items-center justify-between"
                                        >
                                            <span className="flex items-center gap-2 text-[#040404]/60">
                                                <span
                                                    className="size-3 rounded-full"
                                                    style={{ backgroundColor: color }}
                                                />
                                                {label}
                                            </span>
                                            <span className="font-medium">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </article>

                            <article className="rounded-lg border border-[#040404]/10 bg-[#040404] p-5 text-white shadow-sm">
                                <p className="text-sm text-white/52">Quick Overview</p>
                                <p className="mt-3 text-3xl font-semibold">91%</p>
                                <p className="mt-2 text-sm leading-6 text-white/58">
                                    Production readiness across active menu items.
                                </p>
                            </article>
                        </aside>
                    </section>
                </main>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
