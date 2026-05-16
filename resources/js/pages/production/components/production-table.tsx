import { Badge } from '@/components/ui/badge';
import { Link, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    CheckCircle2,
    Clock3,
    Pencil,
    Trash2,
} from 'lucide-react';
import type {
    PaginatedProductionBatches,
    ProductionBatch,
    ProductionFilters,
    ProductionSummary,
} from '../types';

const statusTone: Record<string, string> = {
    planned: 'border-[#040404]/20 text-[#040404]',
    in_progress: 'border-[#faa340] text-[#040404]',
    completed: 'border-[#040404] text-[#faa340]',
    cancelled: 'border-[#040404]/15 text-[#040404]/55',
};

function quantity(value: number, unit: string | null) {
    return `${value.toLocaleString('en-PH', { maximumFractionDigits: 2 })} ${unit ?? 'units'}`;
}

function SortButton({
    field,
    label,
    filters,
}: {
    field: string;
    label: string;
    filters: ProductionFilters;
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
                    '/production',
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

export function ProductionTable({
    batches,
    filters,
    summary,
    onEdit,
}: {
    batches: PaginatedProductionBatches;
    filters: ProductionFilters;
    summary: ProductionSummary;
    onEdit: (batch: ProductionBatch) => void;
}) {
    const deleteBatch = (batch: ProductionBatch) => {
        if (!confirm(`Delete production batch ${batch.batch_number}?`)) {
            return;
        }

        router.delete(`/production/${batch.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <section className="border-y border-[#040404]/15">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#040404]/10 py-2">
                <div>
                    <h2 className="text-sm font-semibold text-[#040404]">
                        Production batches
                    </h2>
                    <p className="text-xs text-[#040404]/60">
                        Showing {batches.meta.from ?? 0}-{batches.meta.to ?? 0}{' '}
                        of {batches.meta.total} batches
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
                        Planned{' '}
                        <strong className="text-[#040404]">
                            {summary.planned}
                        </strong>
                    </span>
                    <span>
                        Active{' '}
                        <strong className="text-[#faa340]">
                            {summary.in_progress}
                        </strong>
                    </span>
                    <span>
                        Completed{' '}
                        <strong className="text-[#040404]">
                            {summary.completed}
                        </strong>
                    </span>
                    <span className="border-l border-[#040404]/15 pl-3">
                        15/page
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[1320px] text-left text-xs">
                    <thead className="text-xs text-[#040404]/65 uppercase">
                        <tr className="border-b border-[#040404]/10">
                            <th className="px-2 py-1.5">
                                <SortButton
                                    field="batch_number"
                                    label="Batch"
                                    filters={filters}
                                />
                            </th>
                            <th className="px-2 py-1.5">Product</th>
                            <th className="px-2 py-1.5">
                                <SortButton
                                    field="planned_quantity"
                                    label="Planned"
                                    filters={filters}
                                />
                            </th>
                            <th className="px-2 py-1.5">
                                <SortButton
                                    field="completed_quantity"
                                    label="Completed"
                                    filters={filters}
                                />
                            </th>
                            <th className="px-2 py-1.5">Waste</th>
                            <th className="px-2 py-1.5">Raw materials</th>
                            <th className="px-2 py-1.5">Synced</th>
                            <th className="px-2 py-1.5">Area</th>
                            <th className="px-2 py-1.5">
                                <SortButton
                                    field="planned_start_date"
                                    label="Start"
                                    filters={filters}
                                />
                            </th>
                            <th className="px-2 py-1.5">Target</th>
                            <th className="px-2 py-1.5">
                                <SortButton
                                    field="completed_at"
                                    label="Completed at"
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
                            <th className="px-2 py-1.5 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {batches.data.map((batch) => (
                            <tr
                                key={batch.id}
                                className="border-b border-[#040404]/10 align-middle last:border-0"
                            >
                                <td className="px-2 py-1 font-mono text-[11px] text-[#040404]/70">
                                    {batch.batch_number}
                                </td>
                                <td className="px-2 py-1">
                                    <p className="max-w-44 truncate font-medium text-[#040404]">
                                        {batch.product_name ??
                                            'Deleted product'}
                                    </p>
                                    <p className="font-mono text-[11px] text-[#040404]/50">
                                        {batch.product_sku ?? 'No SKU'}
                                    </p>
                                </td>
                                <td className="px-2 py-1 text-[#040404]/75">
                                    {quantity(
                                        batch.planned_quantity,
                                        batch.product_unit,
                                    )}
                                </td>
                                <td className="px-2 py-1 text-[#040404]/75">
                                    {quantity(
                                        batch.completed_quantity,
                                        batch.product_unit,
                                    )}
                                </td>
                                <td className="px-2 py-1 text-[#040404]/70">
                                    {quantity(
                                        batch.waste_quantity,
                                        batch.product_unit,
                                    )}
                                </td>
                                <td className="px-2 py-1 text-[#040404]/70">
                                    <div className="max-w-52 space-y-0.5">
                                        {batch.materials
                                            .slice(0, 2)
                                            .map((material) => (
                                                <p
                                                    key={material.id}
                                                    className="truncate"
                                                >
                                                    {material.quantity}{' '}
                                                    {material.unit}{' '}
                                                    {material.name ??
                                                        'Raw material'}
                                                </p>
                                            ))}
                                        {batch.materials.length > 2 && (
                                            <p className="text-[11px] text-[#040404]/45">
                                                +{batch.materials.length - 2}{' '}
                                                more
                                            </p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-2 py-1">
                                    <Badge
                                        variant="outline"
                                        className="gap-1 px-1.5 py-0 text-[11px] text-[#040404]"
                                    >
                                        {batch.stock_synced_quantity > 0 ? (
                                            <CheckCircle2 className="size-3" />
                                        ) : (
                                            <Clock3 className="size-3" />
                                        )}
                                        {quantity(
                                            batch.stock_synced_quantity,
                                            batch.product_unit,
                                        )}
                                    </Badge>
                                </td>
                                <td className="px-2 py-1 text-[#040404]/70">
                                    {batch.production_area || 'Kitchen'}
                                </td>
                                <td className="px-2 py-1 text-[#040404]/70">
                                    {batch.planned_start_date || 'Unscheduled'}
                                </td>
                                <td className="px-2 py-1 text-[#040404]/70">
                                    {batch.target_completion_date ||
                                        'Open target'}
                                </td>
                                <td className="px-2 py-1 text-[#040404]/70">
                                    {batch.completed_at
                                        ? batch.completed_at.replace('T', ' ')
                                        : 'Pending'}
                                </td>
                                <td className="px-2 py-1">
                                    <Badge
                                        variant="secondary"
                                        className={`border px-1.5 py-0 text-[11px] ${statusTone[batch.status] ?? statusTone.planned}`}
                                    >
                                        {batch.status_label}
                                    </Badge>
                                </td>
                                <td className="px-2 py-1 text-right">
                                    <div className="flex justify-end gap-1">
                                        <button
                                            type="button"
                                            className="inline-grid size-7 place-items-center rounded border border-transparent text-[#040404] transition hover:border-[#faa340] hover:text-[#faa340]"
                                            onClick={() => onEdit(batch)}
                                            aria-label={`Edit ${batch.batch_number}`}
                                        >
                                            <Pencil className="size-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-grid size-7 place-items-center rounded border border-transparent text-[#040404] transition hover:border-[#faa340] hover:text-[#faa340]"
                                            onClick={() => deleteBatch(batch)}
                                            aria-label={`Delete ${batch.batch_number}`}
                                        >
                                            <Trash2 className="size-3.5 text-[#040404]" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {batches.data.length === 0 && (
                            <tr>
                                <td
                                    colSpan={13}
                                    className="px-4 py-14 text-center text-[#040404]/60"
                                >
                                    No production batches match the current
                                    filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#040404]/10 py-2">
                <p className="text-xs text-[#040404]/60">
                    Page {batches.meta.current_page} of {batches.meta.last_page}
                </p>
                <div className="flex flex-wrap gap-1">
                    {batches.links.map((link, index) =>
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
