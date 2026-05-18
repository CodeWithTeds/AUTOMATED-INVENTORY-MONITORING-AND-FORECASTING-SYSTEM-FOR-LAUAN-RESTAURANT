import { Head, Link, router } from '@inertiajs/react';
import { Download, PackageCheck, Search, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type {
    PaginatedPurchaseOrders,
    PurchaseOrderFilters,
    PurchaseOrderOption,
    PurchaseOrderSummary,
} from './types';

type Props = {
    purchaseOrders: PaginatedPurchaseOrders;
    filters: PurchaseOrderFilters;
    summary: PurchaseOrderSummary;
    statusOptions: PurchaseOrderOption[];
};

const breadcrumbs = [
    {
        title: 'Purchase Orders',
        href: '/admin/purchase-orders',
    },
];

const peso = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

const statusTone: Record<string, string> = {
    pending: 'border-[#faa340]/60 bg-[#faa340]/10 text-[#040404]',
    draft: 'border-[#040404]/20 bg-white text-[#040404]/70',
    ordered: 'border-[#040404]/20 bg-white text-[#040404]',
    partially_received: 'border-[#faa340]/40 bg-[#faa340]/10 text-[#040404]',
    received: 'border-[#040404]/15 bg-[#040404]/5 text-[#040404]',
    cancelled: 'border-[#040404]/10 bg-white text-[#040404]/45',
};

export default function PurchaseOrdersIndex({
    purchaseOrders,
    filters,
    summary,
    statusOptions,
}: Props) {
    const [values, setValues] = useState({
        search: filters.search ?? '',
        status: filters.status ?? '',
    });

    const applyFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/purchase-orders', values, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    return (
        <>
            <Head title="Purchase Orders" />

            <main className="min-h-screen p-4 text-[#040404] sm:p-5">
                <section className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-[#040404]/55">
                            <ShoppingBag className="size-4 text-[#faa340]" />
                            Purchasing pipeline for kitchen supply readiness
                        </div>
                        <h1 className="mt-1 text-2xl font-semibold tracking-normal text-[#040404]">
                            Purchase Orders
                        </h1>
                    </div>
                </section>

                <section className="mb-4 grid gap-3 md:grid-cols-4">
                    {[
                        ['Total', summary.total],
                        ['Open', summary.open],
                        ['Received', summary.received],
                        ['Open value', peso.format(summary.open_value)],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            className="rounded-md border border-[#040404]/10 bg-white p-4"
                        >
                            <p className="text-xs font-medium text-[#040404]/50">
                                {label}
                            </p>
                            <p className="mt-1 text-2xl font-semibold text-[#040404]">
                                {value}
                            </p>
                        </div>
                    ))}
                </section>

                <form
                    onSubmit={applyFilters}
                    className="mb-4 grid gap-2 rounded-md border border-[#040404]/10 bg-white p-3 md:grid-cols-[minmax(240px,1fr)_180px_auto]"
                >
                    <label className="relative">
                        <span className="sr-only">Search purchase orders</span>
                        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#040404]/35" />
                        <Input
                            value={values.search}
                            onChange={(event) =>
                                setValues((current) => ({
                                    ...current,
                                    search: event.target.value,
                                }))
                            }
                            className="h-10 border-[#040404]/10 pl-9 text-sm focus-visible:border-[#faa340] focus-visible:ring-[#faa340]/20"
                            placeholder="Search PO or supplier"
                            type="search"
                        />
                    </label>
                    <select
                        value={values.status}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                status: event.target.value,
                            }))
                        }
                        className="h-10 rounded-md border border-[#040404]/10 px-3 text-sm text-[#040404] outline-none focus:border-[#faa340] focus:ring-3 focus:ring-[#faa340]/20"
                        aria-label="Filter by status"
                    >
                        <option value="">All statuses</option>
                        {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <button
                        type="submit"
                        className="inline-flex h-10 items-center justify-center rounded-md bg-[#faa340] px-4 text-sm font-semibold text-[#040404] shadow-[0_18px_44px_rgba(250,163,64,0.22)] transition hover:bg-[#f8992f]"
                    >
                        Filter
                    </button>
                </form>

                <section className="overflow-hidden rounded-md border border-[#040404]/10 bg-white">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] text-left text-sm">
                            <thead className="bg-[#fbf8f5] text-xs text-[#040404]/60 uppercase">
                                <tr className="border-b border-[#040404]/10">
                                    <th className="px-3 py-2">PO No.</th>
                                    <th className="px-3 py-2">Supplier</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">Items</th>
                                    <th className="px-3 py-2">Expected</th>
                                    <th className="px-3 py-2">Total</th>
                                    <th className="px-3 py-2">Notes</th>
                                    <th className="px-3 py-2 text-right">
                                        Receipt
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchaseOrders.data.map((order) => (
                                    <tr
                                        key={order.id}
                                        className="border-b border-[#040404]/10 last:border-0"
                                    >
                                        <td className="px-3 py-2 font-mono text-xs text-[#040404]/70">
                                            {order.order_number}
                                        </td>
                                        <td className="px-3 py-2 font-medium text-[#040404]">
                                            {order.supplier_name}
                                        </td>
                                        <td className="px-3 py-2">
                                            <Badge
                                                variant="outline"
                                                className={
                                                    statusTone[order.status] ??
                                                    statusTone.pending
                                                }
                                            >
                                                {order.status_label}
                                            </Badge>
                                        </td>
                                        <td className="px-3 py-2 text-[#040404]/70">
                                            {order.items_count}
                                        </td>
                                        <td className="px-3 py-2 text-[#040404]/70">
                                            {order.expected_at ?? 'TBD'}
                                        </td>
                                        <td className="px-3 py-2 font-semibold text-[#040404]">
                                            {peso.format(order.total_amount)}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span className="block max-w-64 truncate text-[#040404]/55">
                                                {order.notes ?? 'No notes'}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <a
                                                href={`/admin/purchase-orders/${order.id}/receipt`}
                                                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#faa340] px-3 text-xs font-semibold text-[#040404] transition hover:text-[#faa340]"
                                            >
                                                <Download className="size-3.5" />
                                                Download
                                            </a>
                                        </td>
                                    </tr>
                                ))}

                                {purchaseOrders.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={8}
                                            className="px-4 py-14 text-center"
                                        >
                                            <PackageCheck className="mx-auto size-8 text-[#faa340]" />
                                            <p className="mt-3 text-sm text-[#040404]/55">
                                                No purchase orders match the
                                                current filters.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-[#040404]/50">
                        Page {purchaseOrders.meta.current_page} of{' '}
                        {purchaseOrders.meta.last_page}
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {purchaseOrders.links.map((link, index) =>
                            link.url ? (
                                <Link
                                    key={`${link.label}-${index}`}
                                    href={link.url}
                                    preserveScroll
                                    preserveState
                                    className={`inline-flex h-8 min-w-8 items-center justify-center rounded border px-2 text-xs ${
                                        link.active
                                            ? 'border-[#faa340] bg-[#faa340] text-white'
                                            : 'border-[#040404]/10 bg-white text-[#040404]/70 hover:text-[#faa340]'
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ) : (
                                <span
                                    key={`${link.label}-${index}`}
                                    className="inline-flex h-8 min-w-8 items-center justify-center rounded border border-[#040404]/10 bg-white px-2 text-xs text-[#040404]/30"
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            ),
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}

PurchaseOrdersIndex.layout = (page: ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
