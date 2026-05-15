import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BarChart3,
    ChefHat,
    Clock3,
    PackageCheck,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import { dashboard, login } from '@/routes';

const features = [
    {
        title: 'Forecast-ready inventory',
        description: 'Track ingredient movement, stock risk, and prep needs before service gets busy.',
        icon: PackageCheck,
    },
    {
        title: 'Production clarity',
        description: 'Keep kitchen planning close to demand with calm, scannable status views.',
        icon: ChefHat,
    },
    {
        title: 'Admin confidence',
        description: 'A focused dashboard for operators who need fast answers without visual noise.',
        icon: ShieldCheck,
    },
];

const metrics = [
    ['Today', '200+ orders'],
    ['Stock health', '91% ready'],
    ['Prep time', '18 min avg'],
];

export default function Welcome() {
    const { auth } = usePage().props;
    const href = auth.user ? dashboard() : login();

    return (
        <>
            <Head title="Lauan Restaurant">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <main className="min-h-screen bg-[#f7f1ea] text-[#040404]">
                <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                    <Link href="/" className="flex items-center gap-3">
                        <img
                            src="/image.png"
                            alt="Lauan Restaurant"
                            className="size-11 rounded-md object-cover"
                        />
                        <span className="text-sm font-semibold uppercase tracking-[0.16em]">
                            Lauan
                        </span>
                    </Link>

                    <div className="flex items-center gap-3 text-sm font-medium">
                        <a href="#system" className="hidden text-[#040404]/70 sm:inline">
                            System
                        </a>
                        <a href="#operations" className="hidden text-[#040404]/70 sm:inline">
                            Operations
                        </a>
                        <Link
                            href={href}
                            className="inline-flex items-center gap-2 rounded-md bg-[#040404] px-4 py-2 text-white shadow-[0_16px_40px_rgba(4,4,4,0.18)] transition hover:bg-[#2a211c]"
                        >
                            {auth.user ? 'Dashboard' : 'Log in'}
                            <ArrowRight className="size-4" />
                        </Link>
                    </div>
                </nav>

                <section className="mx-auto grid min-h-[calc(100vh-84px)] w-full max-w-7xl items-center gap-10 px-6 pb-14 pt-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
                    <div className="max-w-3xl">
                        <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#040404]/10 bg-white/70 px-3 py-1.5 text-sm text-[#040404]/70 shadow-sm">
                            <Sparkles className="size-4 text-[#faa340]" />
                            Apple-inspired restaurant operations
                        </div>
                        <h1 className="text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
                            Lauan Restaurant
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-[#040404]/68">
                            A polished inventory and forecasting workspace for production,
                            stock visibility, and decisions that need to feel effortless.
                        </p>

                        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href={href}
                                className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-[#faa340] px-6 text-sm font-semibold text-[#040404] shadow-[0_18px_44px_rgba(250,163,64,0.32)] transition hover:bg-[#f8992f]"
                            >
                                Open workspace
                                <ArrowRight className="size-4" />
                            </Link>
                            <a
                                href="#operations"
                                className="inline-flex h-12 items-center justify-center rounded-md border border-[#040404]/12 bg-white/60 px-6 text-sm font-semibold text-[#040404] transition hover:bg-white"
                            >
                                View operations
                            </a>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="absolute left-8 top-10 h-14 w-[76%] -rotate-3 bg-[#faa340]" />
                        <div className="absolute bottom-10 right-0 h-14 w-[62%] -rotate-3 bg-[#e3dad0]" />
                        <div className="relative overflow-hidden rounded-[28px] border border-[#040404]/10 bg-white shadow-[0_34px_110px_rgba(4,4,4,0.16)]">
                            <div className="flex items-center justify-between border-b border-[#040404]/8 px-5 py-4">
                                <div className="flex items-center gap-2">
                                    <span className="size-3 rounded-full bg-[#faa340]" />
                                    <span className="size-3 rounded-full bg-[#e3dad0]" />
                                    <span className="size-3 rounded-full bg-[#040404]" />
                                </div>
                                <span className="text-xs font-medium text-[#040404]/45">
                                    AIMFS Control
                                </span>
                            </div>

                            <div className="grid gap-5 p-5 sm:grid-cols-[0.82fr_1.18fr]">
                                <div className="rounded-lg bg-[#040404] p-5 text-white">
                                    <img
                                        src="/image.png"
                                        alt="Lauan Restaurant mark"
                                        className="mb-10 size-20 rounded-lg object-cover"
                                    />
                                    <p className="text-sm text-white/58">Current shift</p>
                                    <p className="mt-2 text-3xl font-semibold">Freshmart</p>
                                    <div className="mt-8 space-y-3">
                                        {metrics.map(([label, value]) => (
                                            <div key={label} className="rounded-md bg-white/8 p-3">
                                                <p className="text-xs text-white/48">{label}</p>
                                                <p className="mt-1 font-semibold">{value}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="rounded-lg border border-[#040404]/10 bg-[#fbf8f5] p-5">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-[#040404]/55">
                                                    Sales and purchase
                                                </p>
                                                <p className="mt-1 text-3xl font-semibold">49K</p>
                                            </div>
                                            <BarChart3 className="size-7 text-[#faa340]" />
                                        </div>
                                        <div className="mt-6 flex h-40 items-end gap-2">
                                            {[42, 72, 50, 64, 86, 58, 78, 45, 68, 92, 61, 74].map(
                                                (height, index) => (
                                                    <span
                                                        key={index}
                                                        className="flex-1 rounded-t-md bg-[#faa340]"
                                                        style={{ height: `${height}%` }}
                                                    />
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-lg border border-[#040404]/10 bg-white p-4">
                                            <Clock3 className="mb-5 size-5 text-[#faa340]" />
                                            <p className="text-2xl font-semibold">2 days</p>
                                            <p className="text-sm text-[#040404]/52">stock runway</p>
                                        </div>
                                        <div className="rounded-lg border border-[#040404]/10 bg-white p-4">
                                            <PackageCheck className="mb-5 size-5 text-[#faa340]" />
                                            <p className="text-2xl font-semibold">46 packs</p>
                                            <p className="text-sm text-[#040404]/52">recommended</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="operations" className="bg-white px-6 py-20 lg:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr]">
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#faa340]">
                                    Operations
                                </p>
                                <h2 className="mt-3 max-w-md text-4xl font-semibold leading-tight">
                                    Built for calm, fast restaurant decisions.
                                </h2>
                            </div>
                            <div id="system" className="grid gap-4 md:grid-cols-3">
                                {features.map((feature) => (
                                    <article
                                        key={feature.title}
                                        className="rounded-lg border border-[#040404]/10 bg-[#fbf8f5] p-6"
                                    >
                                        <feature.icon className="size-6 text-[#faa340]" />
                                        <h3 className="mt-8 text-lg font-semibold">
                                            {feature.title}
                                        </h3>
                                        <p className="mt-3 text-sm leading-6 text-[#040404]/62">
                                            {feature.description}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
