import { Link, router } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    ImageIcon,
    Pencil,
    ReceiptText,
    Trash2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type {
    PaginatedRecipes,
    RecipeBom,
    RecipeFilters,
    RecipeSummary,
} from '../types';

function money(value: number | null) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(value ?? 0);
}

function SortButton({
    field,
    label,
    filters,
}: {
    field: string;
    label: string;
    filters: RecipeFilters;
}) {
    const active = filters.sort === field;
    const nextDirection =
        active && filters.direction === 'asc' ? 'desc' : 'asc';
    const Icon = active && filters.direction === 'desc' ? ArrowDown : ArrowUp;

    return (
        <button
            type="button"
            className="inline-flex items-center gap-1 text-xs font-semibold whitespace-nowrap text-[#040404]/70 hover:text-[#040404]"
            onClick={() =>
                router.get(
                    '/admin/recipes',
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

export function RecipeBomGrid({
    recipes,
    filters,
    summary,
    onEdit,
    canEdit,
    canDelete,
}: {
    recipes: PaginatedRecipes;
    filters: RecipeFilters;
    summary: RecipeSummary;
    onEdit: (recipe: RecipeBom) => void;
    canEdit: boolean;
    canDelete: boolean;
}) {
    const deleteRecipe = (recipe: RecipeBom) => {
        if (!confirm(`Delete Recipe / BOM for ${recipe.name}?`)) {
            return;
        }

        router.delete(`/admin/recipes/${recipe.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <section className="border-b border-[#040404]/15 pb-2">
            <div className="flex flex-wrap items-center justify-between gap-2 py-2">
                <div>
                    <h2 className="text-sm font-semibold text-[#040404]">
                        Recipe / BOM cards
                    </h2>
                    <p className="text-xs text-[#040404]/60">
                        Showing {recipes.meta.from ?? 0}-{recipes.meta.to ?? 0}{' '}
                        of {recipes.meta.total} menu items
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#040404]/70">
                    <span>
                        Menu items{' '}
                        <strong className="text-[#040404]">
                            {summary.menu_items}
                        </strong>
                    </span>
                    <span>
                        With BOM{' '}
                        <strong className="text-[#faa340]">
                            {summary.with_bom}
                        </strong>
                    </span>
                    <span>
                        Raw materials{' '}
                        <strong className="text-[#040404]">
                            {summary.raw_materials}
                        </strong>
                    </span>
                    <span className="border-l border-[#040404]/15 pl-3">
                        <SortButton
                            field="name"
                            label="Name"
                            filters={filters}
                        />
                    </span>
                    <SortButton
                        field="selling_price"
                        label="Price"
                        filters={filters}
                    />
                    <SortButton
                        field="current_stock"
                        label="Stock"
                        filters={filters}
                    />
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {recipes.data.map((recipe) => (
                    <article
                        key={recipe.id}
                        className="overflow-hidden rounded-md border border-[#040404]/15 bg-white"
                    >
                        {recipe.image_url ? (
                            <img
                                src={recipe.image_url}
                                alt={recipe.name}
                                className="aspect-[16/9] w-full object-cover"
                            />
                        ) : (
                            <div className="grid aspect-[16/9] place-items-center bg-[#f8f4ef] text-[#040404]/45">
                                <ImageIcon className="size-10" />
                            </div>
                        )}
                        <div className="space-y-3 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="truncate text-base font-semibold text-[#040404]">
                                        {recipe.name}
                                    </p>
                                    <p className="font-mono text-[11px] text-[#040404]/50">
                                        {recipe.sku}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    {canEdit && (
                                        <button
                                            type="button"
                                            className="inline-grid size-8 place-items-center rounded border border-transparent text-[#040404] transition hover:border-[#faa340] hover:text-[#faa340]"
                                            onClick={() => onEdit(recipe)}
                                            aria-label={`Edit ${recipe.name}`}
                                        >
                                            <Pencil className="size-4" />
                                        </button>
                                    )}
                                    {canDelete && (
                                        <button
                                            type="button"
                                            className="inline-grid size-8 place-items-center rounded border border-transparent text-[#040404] transition hover:border-[#faa340] hover:text-[#faa340]"
                                            onClick={() =>
                                                deleteRecipe(recipe)
                                            }
                                            aria-label={`Delete ${recipe.name}`}
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    )}
                                    {!canEdit && !canDelete && (
                                        <span className="text-xs font-medium text-[#040404]/45">
                                            Read only
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs">
                                <Badge
                                    variant="outline"
                                    className="border-[#faa340] text-[#040404]"
                                >
                                    {money(recipe.selling_price)}
                                </Badge>
                                <Badge
                                    variant="secondary"
                                    className="border border-[#040404]/15 text-[#040404]"
                                >
                                    {recipe.current_stock} {recipe.unit} stock
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className="gap-1 border-[#040404]/15 text-[#040404]"
                                >
                                    <ReceiptText className="size-3" />
                                    {recipe.materials.length} materials
                                </Badge>
                            </div>

                            <div className="space-y-1.5 border-t border-[#040404]/10 pt-3">
                                {recipe.materials
                                    .slice(0, 4)
                                    .map((material) => (
                                        <div
                                            key={material.id}
                                            className="flex items-center justify-between gap-3 text-xs"
                                        >
                                            <span className="min-w-0 truncate text-[#040404]/75">
                                                {material.name ??
                                                    'Raw material'}
                                            </span>
                                            <span className="shrink-0 font-semibold text-[#040404]">
                                                {material.quantity}{' '}
                                                {material.unit}
                                            </span>
                                        </div>
                                    ))}
                                {recipe.materials.length > 4 && (
                                    <p className="text-xs text-[#040404]/45">
                                        +{recipe.materials.length - 4} more
                                        materials
                                    </p>
                                )}
                                {recipe.materials.length === 0 && (
                                    <p className="text-xs text-[#040404]/55">
                                        No raw materials defined.
                                    </p>
                                )}
                            </div>
                        </div>
                    </article>
                ))}

                {recipes.data.length === 0 && (
                    <div className="rounded-md border border-[#040404]/15 p-10 text-center text-sm text-[#040404]/60 md:col-span-2 xl:col-span-3">
                        No Recipe / BOM records match the current filters.
                    </div>
                )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#040404]/10 pt-2">
                <p className="text-xs text-[#040404]/60">
                    Page {recipes.meta.current_page} of {recipes.meta.last_page}
                </p>
                <div className="flex flex-wrap gap-1">
                    {recipes.links.map((link, index) =>
                        link.url ? (
                            <Link
                                key={`${link.label}-${index}`}
                                href={link.url}
                                preserveScroll
                                preserveState
                                className={`inline-flex h-7 min-w-7 items-center justify-center rounded border px-2 text-xs ${
                                    link.active
                                        ? 'border-[#040404] text-[#faa340]'
                                        : 'border-[#040404]/15 text-[#040404]/65 hover:text-[#040404]'
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
