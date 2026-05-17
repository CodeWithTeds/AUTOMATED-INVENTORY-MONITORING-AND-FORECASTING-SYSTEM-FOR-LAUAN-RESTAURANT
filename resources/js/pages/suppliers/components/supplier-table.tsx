import { Badge } from '@/components/ui/badge';
import { Link, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    FileDown,
    Pencil,
    Star,
    Trash2,
} from 'lucide-react';
import type {
    PaginatedSuppliers,
    Supplier,
    SupplierFilters,
    SupplierSummary,
} from '../types';

const statusTone: Record<string, string> = {
    preferred: 'border-[#faa340] text-[#040404]',
    active: 'border-[#040404]/20 text-[#040404]',
    watchlist: 'border-[#faa340]/60 text-[#040404]',
    inactive: 'border-[#040404]/15 text-[#040404]/55',
};

function SortButton({
    field,
    label,
    filters,
}: {
    field: string;
    label: string;
    filters: SupplierFilters;
}) {
    const active = filters.sort === field;
    const nextDirection =
        active && filters.direction === 'asc' ? 'desc' : 'asc';
    const Icon = active && filters.direction === 'desc' ? ArrowDown : ArrowUp;

    return (
        <button
            type="button"
            className="inline-flex items-center gap-1 font-semibold whitespace-nowrap text-[#040404]/70 hover:text-[#040404]"
            onClick={() =>
                router.get(
                    '/admin/suppliers',
                    { ...filters, sort: field, direction: nextDirection },
                    {
                        preserveScroll: true,
                        preserveState: true,
                        replace: true,
                    },
                )
            }
        >
            {label}
            <Icon
                className={`size-3.5 ${active ? 'opacity-100' : 'opacity-30'}`}
            />
        </button>
    );
}

function reportUrl(filters: SupplierFilters) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            params.set(key, value);
        }
    });

    const query = params.toString();

    return query
        ? `/admin/suppliers/report?${query}`
        : '/admin/suppliers/report';
}

export function SupplierTable({
    suppliers,
    filters,
    summary,
    onEdit,
}: {
    suppliers: PaginatedSuppliers;
    filters: SupplierFilters;
    summary: SupplierSummary;
    onEdit: (supplier: Supplier) => void;
}) {
    const deleteSupplier = (supplier: Supplier) => {
        if (!confirm(`Delete ${supplier.name} from suppliers?`)) {
            return;
        }

        router.delete(`/admin/suppliers/${supplier.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <section className="border-y border-[#040404]/15">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#040404]/10 py-2">
                <div>
                    <h2 className="text-sm font-semibold text-[#040404]">
                        Supplier masterlist
                    </h2>
                    <p className="text-xs text-[#040404]/60">
                        Showing {suppliers.meta.from ?? 0}-
                        {suppliers.meta.to ?? 0} of {suppliers.meta.total}{' '}
                        suppliers
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#040404]/70">
                    <span>
                        Total{' '}
                        <strong className="text-[#040404]">
                            {summary.total}
                        </strong>
                    </span>
                    <span>
                        Preferred{' '}
                        <strong className="text-[#faa340]">
                            {summary.preferred}
                        </strong>
                    </span>
                    <span>
                        Watchlist{' '}
                        <strong className="text-[#040404]">
                            {summary.watchlist}
                        </strong>
                    </span>
                    <span>
                        Avg lead{' '}
                        <strong className="text-[#040404]">
                            {summary.average_lead_time}d
                        </strong>
                    </span>
                    <a
                        href={reportUrl(filters)}
                        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-[#faa340] px-2 font-medium text-[#040404] transition hover:text-[#faa340]"
                    >
                        <FileDown className="size-3.5" />
                        Compact report
                    </a>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[1060px] text-left text-xs">
                    <thead className="text-xs text-[#040404]/65 uppercase">
                        <tr className="border-b border-[#040404]/10">
                            <th className="px-2 py-1.5">
                                <SortButton
                                    field="name"
                                    label="Supplier"
                                    filters={filters}
                                />
                            </th>
                            <th className="px-2 py-1.5">
                                <SortButton
                                    field="category"
                                    label="Category"
                                    filters={filters}
                                />
                            </th>
                            <th className="px-2 py-1.5">Contact</th>
                            <th className="px-2 py-1.5">
                                <SortButton
                                    field="city"
                                    label="Location"
                                    filters={filters}
                                />
                            </th>
                            <th className="px-2 py-1.5">
                                <SortButton
                                    field="lead_time_days"
                                    label="Terms"
                                    filters={filters}
                                />
                            </th>
                            <th className="px-2 py-1.5">
                                <SortButton
                                    field="rating"
                                    label="Rating"
                                    filters={filters}
                                />
                            </th>
                            <th className="px-2 py-1.5">
                                <SortButton
                                    field="status"
                                    label="Status"
                                    filters={filters}
                                />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {suppliers.data.map((supplier) => (
                            <tr
                                key={supplier.id}
                                className="border-b border-[#040404]/10 align-middle last:border-0"
                            >
                                <td className="px-2 py-1.5">
                                    <p className="max-w-56 truncate font-medium text-[#040404]">
                                        {supplier.name}
                                    </p>
                                    <p className="font-mono text-[11px] text-[#040404]/55">
                                        {supplier.code}
                                    </p>
                                </td>
                                <td className="px-2 py-1.5 text-[#040404]/75">
                                    {supplier.category_label}
                                </td>
                                <td className="px-2 py-1.5">
                                    <p className="max-w-44 truncate text-[#040404]/75">
                                        {supplier.contact_person ||
                                            'Unassigned'}
                                    </p>
                                    <p className="max-w-44 truncate text-[11px] text-[#040404]/55">
                                        {supplier.phone ||
                                            supplier.email ||
                                            'No contact yet'}
                                    </p>
                                </td>
                                <td className="px-2 py-1.5">
                                    <p className="max-w-44 truncate text-[#040404]/75">
                                        {supplier.city || 'Unspecified'}
                                    </p>
                                    <p className="max-w-44 truncate text-[11px] text-[#040404]/55">
                                        {supplier.address || 'Address pending'}
                                    </p>
                                </td>
                                <td className="px-2 py-1.5">
                                    <p className="text-[#040404]/75">
                                        {supplier.payment_terms || 'Terms TBD'}
                                    </p>
                                    <p className="text-[11px] text-[#040404]/55">
                                        {supplier.lead_time_days} day lead time
                                    </p>
                                </td>
                                <td className="px-2 py-1.5">
                                    <div className="flex items-center gap-1 text-[#040404]">
                                        <Star className="size-3.5 fill-[#faa340] text-[#faa340]" />
                                        <span className="font-semibold">
                                            {supplier.rating}/5
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-[#040404]/55">
                                        Vendor score
                                    </p>
                                </td>
                                <td className="px-2 py-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <Badge
                                            variant="outline"
                                            className={`px-1.5 py-0 text-[11px] ${statusTone[supplier.status] ?? statusTone.active}`}
                                        >
                                            {supplier.status_label}
                                        </Badge>
                                        <div className="flex gap-1">
                                            <button
                                                type="button"
                                                className="inline-grid size-7 place-items-center rounded border border-transparent text-[#040404] transition hover:border-[#faa340] hover:text-[#faa340]"
                                                onClick={() => onEdit(supplier)}
                                                aria-label={`Edit ${supplier.name}`}
                                            >
                                                <Pencil className="size-3.5" />
                                            </button>
                                            <button
                                                type="button"
                                                className="inline-grid size-7 place-items-center rounded border border-transparent text-[#040404] transition hover:border-[#faa340] hover:text-[#faa340]"
                                                onClick={() =>
                                                    deleteSupplier(supplier)
                                                }
                                                aria-label={`Delete ${supplier.name}`}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {suppliers.data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-4 py-14 text-center text-[#040404]/60"
                                >
                                    No suppliers match the current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#040404]/10 py-2">
                <p className="text-xs text-[#040404]/60">
                    Page {suppliers.meta.current_page} of{' '}
                    {suppliers.meta.last_page}
                </p>
                <div className="flex flex-wrap gap-1">
                    {suppliers.links.map((link, index) =>
                        link.url ? (
                            <Link
                                key={`${link.label}-${index}`}
                                href={link.url}
                                preserveScroll
                                preserveState
                                className={`inline-flex h-7 min-w-7 items-center justify-center rounded border px-2 text-xs ${
                                    link.active
                                        ? 'border-[#040404] text-[#faa340]'
                                        : 'border-[#040404]/15 text-[#040404]/75 hover:text-[#faa340]'
                                }`}
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ) : (
                            <span
                                key={`${link.label}-${index}`}
                                className="inline-flex h-7 min-w-7 items-center justify-center rounded border border-[#040404]/10 px-2 text-xs text-[#040404]/35"
                                dangerouslySetInnerHTML={{
                                    __html: link.label,
                                }}
                            />
                        ),
                    )}
                </div>
            </div>
        </section>
    );
}
