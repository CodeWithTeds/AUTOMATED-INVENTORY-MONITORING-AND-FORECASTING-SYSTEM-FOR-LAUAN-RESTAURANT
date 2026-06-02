import { Link, router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ImageIcon, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type {
    InventoryFilters,
    InventoryItem,
    InventorySummary,
    PaginatedInventoryItems,
} from '../types';

const stockTone = {
    healthy: 'border-[#040404]/15 text-[#040404]',
    low: 'border-[#faa340]/60 text-[#040404]',
    critical: 'border-[#faa340] text-[#040404]',
    out: 'border-[#040404]/20 text-[#040404]',
};

const stockLabel = {
    healthy: 'Healthy',
    low: 'Low',
    critical: 'Critical',
    out: 'Out',
};

function money(value: number) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(value);
}

function SortButton({
    field,
    label,
    filters,
}: {
    field: string;
    label: string;
    filters: InventoryFilters;
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
                    '/admin/inventory',
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

export function InventoryTable({
    items,
    filters,
    summary,
    onEdit,
    canEdit,
    canDelete,
}: {
    items: PaginatedInventoryItems;
    filters: InventoryFilters;
    summary: InventorySummary;
    onEdit: (item: InventoryItem) => void;
    canEdit: boolean;
    canDelete: boolean;
}) {
    const deleteItem = (item: InventoryItem) => {
        if (!confirm(`Delete ${item.name} from inventory?`)) {
            return;
        }

        router.delete(`/admin/inventory/${item.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <section className="border-y border-[#040404]/15">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#040404]/10 py-2">
                <div>
                    <h2 className="text-sm font-semibold text-[#040404]">
                        Inventory products
                    </h2>
                    <p className="text-xs text-[#040404]/60">
                        Showing {items.meta.from ?? 0}-{items.meta.to ?? 0} of{' '}
                        {items.meta.total} products
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
                        Critical{' '}
                        <strong className="text-[#faa340]">
                            {summary.critical}
                        </strong>
                    </span>
                    <span>
                        Below par{' '}
                        <strong className="text-[#040404]">
                            {summary.low}
                        </strong>
                    </span>
                    <span>
                        Out{' '}
                        <strong className="text-[#040404]">
                            {summary.out}
                        </strong>
                    </span>
                    <span className="border-l border-[#040404]/15 pl-3">
                        15/page
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[1420px] text-left text-xs">
                    <thead className="text-xs text-[#040404]/65 uppercase">
                        <tr className="border-b border-[#040404]/10">
                            <th className="w-10 px-2 py-1.5">Img</th>
                            <th className="px-2 py-1.5">
                                <SortButton
                                    field="sku"
                                    label="SKU"
                                    filters={filters}
                                />
                            </th>
                            <th className="px-2 py-1.5">
                                <SortButton
                                    field="name"
                                    label="Product"
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
                            <th className="px-2 py-1.5">Supplier</th>
                            <th className="px-2 py-1.5">Unit</th>
                            <th className="px-2 py-1.5">
                                <SortButton
                                    field="current_stock"
                                    label="Stock"
                                    filters={filters}
                                />
                            </th>
                            <th className="px-2 py-1.5">Par</th>
                            <th className="px-2 py-1.5">Reorder</th>
                            <th className="px-2 py-1.5">Forecast</th>
                            <th className="px-2 py-1.5">
                                <SortButton
                                    field="unit_cost"
                                    label="Cost"
                                    filters={filters}
                                />
                            </th>
                            <th className="px-2 py-1.5">Storage</th>
                            <th className="px-2 py-1.5">
                                <SortButton
                                    field="expiration_date"
                                    label="Expiry"
                                    filters={filters}
                                />
                            </th>
                            <th className="px-2 py-1.5">Status</th>
                            <th className="px-2 py-1.5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.data.map((item) => (
                            <tr
                                key={item.id}
                                className="border-b border-[#040404]/10 align-middle last:border-0"
                            >
                                <td className="px-2 py-1">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            alt={item.name}
                                            className="size-7 rounded object-cover ring-1 ring-[#040404]/15"
                                        />
                                    ) : (
                                        <span className="grid size-7 place-items-center rounded text-[#040404]/45 ring-1 ring-[#040404]/15">
                                            <ImageIcon className="size-3.5" />
                                        </span>
                                    )}
                                </td>
                                <td className="px-2 py-1 font-mono text-[11px] text-[#040404]/70">
                                    {item.sku}
                                </td>
                                <td className="px-2 py-1">
                                    <p className="max-w-40 truncate font-medium text-[#040404]">
                                        {item.name}
                                    </p>
                                </td>
                                <td className="px-2 py-1 text-[#040404]/75">
                                    {item.category_label}
                                </td>
                                <td className="px-2 py-1 text-[#040404]/70">
                                    {item.supplier || 'Unassigned'}
                                </td>
                                <td className="px-2 py-1 text-[#040404]/70">
                                    {item.unit}
                                </td>
                                <td className="px-2 py-1">
                                    <Badge
                                        variant="outline"
                                        className={`px-1.5 py-0 text-[11px] ${stockTone[item.stock_state]}`}
                                    >
                                        {item.current_stock} {item.unit}
                                    </Badge>
                                </td>
                                <td className="px-2 py-1 text-[#040404]/70">
                                    {item.par_level}
                                </td>
                                <td className="px-2 py-1 text-[#040404]/70">
                                    {item.reorder_point} /{' '}
                                    {item.reorder_quantity}
                                </td>
                                <td className="px-2 py-1 text-[#040404]/70">
                                    {item.daily_usage_rate}/day,{' '}
                                    {item.lead_time_days}d
                                </td>
                                <td className="px-2 py-1 text-[#040404]/75">
                                    {money(item.unit_cost)}
                                </td>
                                <td className="px-2 py-1 text-[#040404]/70">
                                    {item.storage_area || 'Kitchen'}
                                </td>
                                <td className="px-2 py-1 text-[#040404]/70">
                                    {item.expiration_date || 'Shelf stable'}
                                </td>
                                <td className="px-2 py-1">
                                    <div className="flex items-center gap-1.5">
                                        <Badge
                                            variant="secondary"
                                            className="border-[#040404] px-1.5 py-0 text-[11px] text-[#faa340]"
                                        >
                                            {item.status_label}
                                        </Badge>
                                        <span className="text-[11px] text-[#040404]/55">
                                            {stockLabel[item.stock_state]}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-2 py-1 text-right">
                                    <div className="flex justify-end gap-1">
                                        {canEdit && (
                                            <button
                                                type="button"
                                                className="inline-grid size-7 place-items-center rounded border border-transparent text-[#040404] transition hover:border-[#faa340] hover:text-[#faa340]"
                                                onClick={() => onEdit(item)}
                                                aria-label={`Edit ${item.name}`}
                                            >
                                                <Pencil className="size-3.5" />
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                type="button"
                                                className="inline-grid size-7 place-items-center rounded border border-transparent text-[#040404] transition hover:border-[#faa340] hover:text-[#faa340]"
                                                onClick={() =>
                                                    deleteItem(item)
                                                }
                                                aria-label={`Delete ${item.name}`}
                                            >
                                                <Trash2 className="size-3.5 text-[#040404]" />
                                            </button>
                                        )}
                                        {!canEdit && !canDelete && (
                                            <span className="text-[11px] font-medium text-[#040404]/45">
                                                Read only
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {items.data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={15}
                                    className="px-4 py-14 text-center text-[#040404]/60"
                                >
                                    No products match the current filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#040404]/10 py-2">
                <p className="text-xs text-[#040404]/60">
                    Page {items.meta.current_page} of {items.meta.last_page}
                </p>
                <div className="flex flex-wrap gap-1">
                    {items.links.map((link, index) =>
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
