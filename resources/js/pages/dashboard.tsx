import { Head, usePage } from '@inertiajs/react';
import {
    Bell,
    CalendarDays,
    CircleDollarSign,
    Expand,
    Inbox,
    PackageMinus,
    PlusCircle,
    Search,
    Settings,
    ShoppingCart,
    Store,
} from 'lucide-react';
import type { ReactNode } from 'react';

const statCards = [
    {
        label: 'Low Stock',
        value: '5468',
        delta: '+19.01%',
        tone: 'positive',
        icon: Store,
        bars: [28, 52, 40, 72, 48, 66, 38],
    },
    {
        label: 'Critical Items',
        value: '4598',
        delta: '-12%',
        tone: 'positive',
        icon: ShoppingCart,
        bars: [22, 45, 32, 58, 40, 76, 50],
    },
    {
        label: 'Total Inventory',
        value: '3698',
        delta: '+6%',
        tone: 'positive',
        icon: PackageMinus,
        bars: [45, 60, 55, 58, 51, 62, 48],
    },
    {
        label: 'Total Earnings',
        value: '$89,878,58',
        delta: '-16%',
        tone: 'negative',
        icon: CircleDollarSign,
        bars: [36, 70, 44, 74, 52, 68, 48],
    },
];

const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'July',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];
const purchaseHeights = [82, 58, 36, 82, 66, 82, 36, 45, 82, 52, 70, 48];
const salesHeights = [21, 36, 14, 21, 41, 21, 14, 26, 66, 8, 46, 21];

function DateButton({ children }: { children: ReactNode }) {
    return (
        <button className="inline-flex h-11 items-center gap-2 rounded-md border border-[#dfe4ea] bg-white px-4 text-sm font-medium text-[#27313f] shadow-sm">
            <CalendarDays className="size-4" />
            {children}
        </button>
    );
}

function DonutPanel({ title }: { title: string }) {
    return (
        <article className="overflow-hidden rounded-lg border border-[#dfe4ea] bg-white">
            <header className="flex items-center justify-between border-b border-[#e7ebef] px-6 py-5">
                <h2 className="text-xl font-semibold text-[#202936]">
                    {title}
                </h2>
                <DateButton>This Month</DateButton>
            </header>

            <div className="px-6 py-7">
                <div className="mx-auto grid size-44 place-items-center rounded-full bg-[conic-gradient(#faa340_0_22%,#facc15_22%_47%,#1f63ed_47%_100%)] shadow-[0_16px_44px_rgba(4,4,4,0.08)]">
                    <div className="grid size-20 place-items-center rounded-full bg-white text-sm font-semibold text-[#202936]">
                        60%
                    </div>
                </div>

                <div className="mt-7 space-y-3 text-sm">
                    {[
                        ['Basic', '60%', '#faa340'],
                        ['Premium', '20%', '#facc15'],
                        ['Enterprise', '20%', '#1f63ed'],
                    ].map(([label, value, color]) => (
                        <div
                            key={label}
                            className="flex items-center justify-between"
                        >
                            <span className="flex items-center gap-2 text-[#687280]">
                                <span
                                    className="size-3 rounded-full"
                                    style={{ backgroundColor: color }}
                                />
                                {label}
                            </span>
                            <span className="font-medium text-[#202936]">
                                {value}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </article>
    );
}

export default function Dashboard() {
    const { auth } = usePage().props;
    const firstName = auth.user?.name?.split(' ')[0] ?? 'Renz';

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
                            <button className="inline-flex h-10 items-center gap-2 rounded-md border border-[#dfe4ea] bg-white px-3 text-sm text-[#202936]">
                                <img
                                    src="/image.png"
                                    alt=""
                                    className="size-5 rounded object-cover"
                                />
                                Freshmart
                            </button>
                            <button className="inline-flex h-10 items-center gap-2 rounded-md bg-[#faa340] px-4 text-sm font-medium text-white shadow-[0_10px_24px_rgba(250,163,64,0.26)]">
                                <PlusCircle className="size-4" />
                                Add New
                            </button>
                            <button className="inline-flex h-10 items-center gap-2 rounded-md bg-[#06294f] px-4 text-sm font-medium text-white">
                                <Store className="size-4" />
                                POS
                            </button>
                            <button className="grid size-10 place-items-center rounded-md bg-[#f8f9fa]">
                                🇺🇸
                            </button>
                            <button className="grid size-10 place-items-center rounded-md bg-[#f8f9fa]">
                                <Expand className="size-5 text-[#6b7280]" />
                            </button>
                            <button className="relative grid size-10 place-items-center rounded-md bg-[#f8f9fa]">
                                <Inbox className="size-5 text-[#6b7280]" />
                                <span className="absolute -top-1 right-0 rounded-full bg-red-600 px-1.5 text-xs font-semibold text-white">
                                    01
                                </span>
                            </button>
                            <button className="grid size-10 place-items-center rounded-md bg-[#f8f9fa]">
                                <Bell className="size-5 text-[#6b7280]" />
                            </button>
                            <button className="grid size-10 place-items-center rounded-md bg-[#f8f9fa]">
                                <Settings className="size-5 text-[#6b7280]" />
                            </button>
                            <div className="grid size-10 place-items-center rounded-md bg-[#e3dad0] text-sm font-semibold text-[#040404]">
                                {firstName.charAt(0)}
                            </div>
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
                                        200+
                                    </span>{' '}
                                    Orders, Today
                                </p>
                            </div>
                            <DateButton>01 Jan 2024 - 07 Jan 2024</DateButton>
                        </div>
                    </div>

                    <div className="space-y-5 p-4 sm:p-5">
                        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {statCards.map((stat) => (
                                <article
                                    key={stat.label}
                                    className="rounded-lg border border-[#dfe4ea] bg-white p-5 shadow-[0_2px_6px_rgba(4,4,4,0.04)]"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="grid size-12 place-items-center rounded-md bg-[#172554] text-white">
                                            <stat.icon
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
                                            {stat.bars.map((height, index) => (
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
                                            ))}
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </section>

                        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                            <article className="overflow-hidden rounded-lg border border-[#dfe4ea] bg-white">
                                <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7ebef] px-5 py-4">
                                    <h2 className="flex items-center gap-3 text-xl font-semibold text-[#202936]">
                                        <span className="grid size-10 place-items-center rounded-md bg-[#fff4e7] text-[#faa340]">
                                            <ShoppingCart className="size-5" />
                                        </span>
                                        Sales & Purchase
                                    </h2>
                                    <div className="flex overflow-hidden rounded-md border border-[#edf0f3] text-sm">
                                        {[
                                            '1D',
                                            '1W',
                                            '1M',
                                            '3M',
                                            '6M',
                                            '1Y',
                                        ].map((range) => (
                                            <button
                                                key={range}
                                                className={`h-10 border-r border-[#edf0f3] px-4 last:border-r-0 ${
                                                    range === '1Y'
                                                        ? 'bg-[#e94b1a] text-white'
                                                        : 'bg-[#fbfcfd] text-[#202936]'
                                                }`}
                                            >
                                                {range}
                                            </button>
                                        ))}
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
                                                49K
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-[#dfe4ea] px-3 py-3">
                                            <p className="flex items-center gap-2 text-base text-[#687280]">
                                                <span className="size-2 rounded-full bg-[#faa340]" />
                                                Total Sales
                                            </p>
                                            <p className="mt-2 text-2xl font-semibold">
                                                38K
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[40px_1fr] gap-4">
                                        <div className="flex h-64 flex-col justify-between text-sm text-[#687280]">
                                            {[
                                                '60K',
                                                '50K',
                                                '40K',
                                                '30K',
                                                '20K',
                                                '10K',
                                                '0',
                                            ].map((label) => (
                                                <span key={label}>{label}</span>
                                            ))}
                                        </div>

                                        <div className="grid h-64 grid-cols-12 items-end gap-4 overflow-x-auto">
                                            {months.map((month, index) => (
                                                <div
                                                    key={month}
                                                    className="flex min-w-10 flex-col items-center gap-3"
                                                >
                                                    <div className="flex h-52 w-full items-end">
                                                        <div
                                                            className="relative w-full rounded-t-xl bg-[#ffdfc0]"
                                                            style={{
                                                                height: `${purchaseHeights[index]}%`,
                                                            }}
                                                        >
                                                            <span
                                                                className="absolute bottom-0 left-0 w-full rounded-t-xl bg-[#faa340]"
                                                                style={{
                                                                    height: `${salesHeights[index]}%`,
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                    <span className="text-sm text-[#687280]">
                                                        {month}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </article>

                            <DonutPanel title="Production" />
                        </section>

                        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                            <article className="rounded-lg border border-[#dfe4ea] bg-white p-5">
                                <div className="mb-10 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">
                                        Forecast Alert
                                    </h2>
                                    <DateButton>2023</DateButton>
                                </div>
                                <div className="space-y-9">
                                    {['60k', '50k', '40k', '30k'].map(
                                        (label) => (
                                            <div
                                                key={label}
                                                className="grid grid-cols-[40px_1fr] items-center gap-4"
                                            >
                                                <span className="text-sm text-[#687280]">
                                                    {label}
                                                </span>
                                                <span className="h-px bg-[#dfe4ea]" />
                                            </div>
                                        ),
                                    )}
                                </div>
                            </article>

                            <DonutPanel title="Quick Overview" />
                        </section>
                    </div>
                </section>
            </main>
        </>
    );
}
