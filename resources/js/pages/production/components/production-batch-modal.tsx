import InputError from '@/components/input-error';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import {
    Clock3,
    ImageIcon,
    LoaderCircle,
    PackageCheck,
    Utensils,
} from 'lucide-react';
import { FormEvent, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
    MenuItemOption,
    ProductionBatch,
    ProductionFormData,
    ProductionOption,
} from '../types';

const blankForm = (
    menuItemOptions: MenuItemOption[],
    statusOptions: ProductionOption[],
): ProductionFormData => ({
    batch_number: '',
    inventory_item_id: menuItemOptions[0]?.id
        ? String(menuItemOptions[0].id)
        : '',
    planned_quantity: '0',
    completed_quantity: '0',
    waste_quantity: '0',
    production_area: 'Kitchen',
    planned_start_date: '',
    target_completion_date: '',
    completed_at: '',
    status: statusOptions[0]?.value ?? 'planned',
    notes: '',
});

const batchToForm = (batch: ProductionBatch): ProductionFormData => ({
    batch_number: batch.batch_number,
    inventory_item_id: String(batch.inventory_item_id),
    planned_quantity: String(batch.planned_quantity),
    completed_quantity: String(batch.completed_quantity),
    waste_quantity: String(batch.waste_quantity),
    production_area: batch.production_area ?? '',
    planned_start_date: batch.planned_start_date ?? '',
    target_completion_date: batch.target_completion_date ?? '',
    completed_at: batch.completed_at ?? '',
    status: batch.status,
    notes: batch.notes ?? '',
});

function Field({
    label,
    error,
    children,
    className = '',
}: {
    label: string;
    error?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <Label className="text-xs font-semibold text-[#040404]/70 uppercase">
                {label}
            </Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

function money(value: number | null) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        maximumFractionDigits: 2,
    }).format(value ?? 0);
}

function dateTimeLocalNow() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());

    return now.toISOString().slice(0, 16);
}

export function ProductionBatchModal({
    open,
    onOpenChange,
    batch,
    menuItemOptions,
    statusOptions,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    batch: ProductionBatch | null;
    menuItemOptions: MenuItemOption[];
    statusOptions: ProductionOption[];
}) {
    const isEditing = batch !== null;
    const defaults = useMemo(
        () =>
            batch
                ? batchToForm(batch)
                : blankForm(menuItemOptions, statusOptions),
        [batch, menuItemOptions, statusOptions],
    );
    const {
        data,
        setData,
        post,
        processing,
        errors,
        reset,
        clearErrors,
        transform,
    } = useForm<ProductionFormData>(defaults);
    const selectedMenuItem = menuItemOptions.find(
        (item) => String(item.id) === data.inventory_item_id,
    );
    const completedQuantity = Number(data.completed_quantity) || 0;
    const currentStock = selectedMenuItem?.current_stock ?? 0;
    const stockAfterCompletion = currentStock + completedQuantity;

    useEffect(() => {
        setData(defaults);
        clearErrors();
    }, [clearErrors, defaults, setData]);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        };

        if (isEditing) {
            transform((current) => ({
                ...current,
                _method: 'put',
            }));
            post(`/production/${batch.id}`, options);
            return;
        }

        transform((current) => current);
        post('/production', options);
    };

    const updateStatus = (status: string) => {
        setData((current) => ({
            ...current,
            status,
            completed_at:
                status === 'completed' && !current.completed_at
                    ? dateTimeLocalNow()
                    : current.completed_at,
        }));
    };

    const updateAvailableProduct = (quantity: string) => {
        setData((current) => ({
            ...current,
            completed_quantity: quantity,
            status:
                Number(quantity) > 0 && current.status !== 'cancelled'
                    ? 'completed'
                    : current.status,
            completed_at:
                Number(quantity) > 0 && !current.completed_at
                    ? dateTimeLocalNow()
                    : current.completed_at,
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-5xl">
                <form onSubmit={submit}>
                    <div className="grid lg:grid-cols-[0.9fr_1.5fr]">
                        <aside className="border-b border-[#040404]/10 p-5 text-[#040404] lg:border-r lg:border-b-0">
                            <DialogHeader>
                                <DialogTitle className="text-2xl text-[#040404]">
                                    {isEditing
                                        ? 'Edit production batch'
                                        : 'Create production batch'}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-[#040404]/65">
                                    Select a Recipe / BOM item. Production will
                                    deduct the needed raw materials when the
                                    batch is completed.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="mt-5 overflow-hidden rounded-md border border-[#040404]/15">
                                {selectedMenuItem?.image_url ? (
                                    <img
                                        src={selectedMenuItem.image_url}
                                        alt={selectedMenuItem.name}
                                        className="aspect-[4/3] w-full object-cover"
                                    />
                                ) : (
                                    <div className="grid aspect-[4/3] place-items-center bg-[#f8f4ef] text-[#040404]/45">
                                        <ImageIcon className="size-12" />
                                    </div>
                                )}
                                <div className="space-y-2 p-4">
                                    <div>
                                        <p className="text-sm font-semibold text-[#040404]">
                                            {selectedMenuItem?.name ??
                                                'No menu item selected'}
                                        </p>
                                        <p className="font-mono text-xs text-[#040404]/55">
                                            {selectedMenuItem?.sku ??
                                                'Create a Recipe / BOM first'}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <span className="rounded border border-[#040404]/10 p-2">
                                            <span className="block text-[#040404]/55">
                                                POS price
                                            </span>
                                            <strong>
                                                {money(
                                                    selectedMenuItem?.selling_price ??
                                                        null,
                                                )}
                                            </strong>
                                        </span>
                                        <span className="rounded border border-[#040404]/10 p-2">
                                            <span className="block text-[#040404]/55">
                                                Current stock
                                            </span>
                                            <strong>
                                                {selectedMenuItem?.current_stock ??
                                                    0}{' '}
                                                {selectedMenuItem?.unit ??
                                                    'units'}
                                            </strong>
                                            <span className="mt-1 block text-[11px] font-normal text-[#040404]/50">
                                                Read-only POS/menu stock
                                            </span>
                                        </span>
                                    </div>
                                    <div className="rounded border border-[#faa340]/70 p-2 text-xs">
                                        <span className="block text-[#040404]/55">
                                            Stock after available product
                                        </span>
                                        <strong>
                                            {stockAfterCompletion}{' '}
                                            {selectedMenuItem?.unit ?? 'units'}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 rounded-md border border-[#faa340] p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[#040404]">
                                    <PackageCheck className="size-4 text-[#faa340]" />
                                    Recipe / BOM is automatic
                                </div>
                                <p className="mt-2 text-xs text-[#040404]/60">
                                    The raw materials below come from the
                                    selected menu item's BOM and are scaled by
                                    the production quantity.
                                </p>
                            </div>
                        </aside>

                        <div className="p-5 [&_input]:border-[#040404]/15 [&_input]:text-[#040404] [&_input]:focus-visible:border-[#faa340] [&_input]:focus-visible:ring-[#faa340]/30">
                            <div className="mb-5 border-b border-[#040404]/10 pb-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[#040404]">
                                    <Utensils className="size-4 text-[#faa340]" />
                                    Menu item from Recipe / BOM
                                </div>
                                <p className="mt-1 text-sm text-[#040404]/60">
                                    Production uses the saved BOM and syncs
                                    finished product stock for POS.
                                </p>
                            </div>

                            <div className="space-y-5">
                                <section className="border-b border-[#040404]/10 pb-5">
                                    <h3 className="mb-3 text-xs font-bold tracking-wide text-[#faa340] uppercase">
                                        Batch output
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-6">
                                        <Field
                                            label="Batch number"
                                            error={errors.batch_number}
                                            className="md:col-span-2"
                                        >
                                            <Input
                                                value={data.batch_number}
                                                onChange={(event) =>
                                                    setData(
                                                        'batch_number',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="PRD-2026-001"
                                            />
                                        </Field>
                                        <Field
                                            label="Menu item"
                                            error={errors.inventory_item_id}
                                            className="md:col-span-4"
                                        >
                                            <select
                                                value={data.inventory_item_id}
                                                onChange={(event) =>
                                                    setData(
                                                        'inventory_item_id',
                                                        event.target.value,
                                                    )
                                                }
                                                className="h-9 w-full rounded-md border border-[#040404]/15 px-3 text-sm text-[#040404] shadow-xs outline-none focus:border-[#faa340] focus:ring-3 focus:ring-[#faa340]/30"
                                            >
                                                <option value="">
                                                    Select menu item
                                                </option>
                                                {menuItemOptions.map((item) => (
                                                    <option
                                                        key={item.id}
                                                        value={item.id}
                                                    >
                                                        {item.name} ({item.sku})
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                        <Field
                                            label="Planned qty"
                                            error={errors.planned_quantity}
                                            className="md:col-span-2"
                                        >
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.planned_quantity}
                                                onChange={(event) =>
                                                    setData(
                                                        'planned_quantity',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field
                                            label="Available product"
                                            error={errors.completed_quantity}
                                            className="md:col-span-2"
                                        >
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.completed_quantity}
                                                onChange={(event) =>
                                                    updateAvailableProduct(
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <p className="text-xs text-[#040404]/55">
                                                This quantity becomes POS stock
                                                and deducts raw materials from
                                                inventory.
                                            </p>
                                        </Field>
                                        <Field
                                            label="Waste qty"
                                            error={errors.waste_quantity}
                                            className="md:col-span-2"
                                        >
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.waste_quantity}
                                                onChange={(event) =>
                                                    setData(
                                                        'waste_quantity',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                    </div>
                                </section>

                                <section className="border-b border-[#040404]/10 pb-5">
                                    <h3 className="mb-3 text-xs font-bold tracking-wide text-[#faa340] uppercase">
                                        Recipe / BOM materials
                                    </h3>
                                    <div className="grid gap-2 md:grid-cols-2">
                                        {selectedMenuItem?.materials.map(
                                            (material) => (
                                                <div
                                                    key={
                                                        material.raw_material_id
                                                    }
                                                    className="rounded-md border border-[#040404]/15 p-3"
                                                >
                                                    <p className="text-sm font-semibold text-[#040404]">
                                                        {material.name ??
                                                            'Raw material'}
                                                    </p>
                                                    <p className="font-mono text-[11px] text-[#040404]/50">
                                                        {material.sku ??
                                                            'No SKU'}
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#040404]/70">
                                                        <span>
                                                            Uses{' '}
                                                            <strong className="text-[#040404]">
                                                                {
                                                                    material.quantity
                                                                }{' '}
                                                                {material.unit}
                                                            </strong>{' '}
                                                            per item
                                                        </span>
                                                        <span>
                                                            Stock{' '}
                                                            <strong className="text-[#040404]">
                                                                {
                                                                    material.available_stock
                                                                }
                                                            </strong>
                                                        </span>
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                        {!selectedMenuItem && (
                                            <p className="rounded-md border border-[#040404]/15 p-4 text-sm text-[#040404]/60 md:col-span-2">
                                                Select a menu item with a saved
                                                BOM.
                                            </p>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="mb-3 text-xs font-bold tracking-wide text-[#faa340] uppercase">
                                        Schedule
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-6">
                                        <Field
                                            label="Status"
                                            error={errors.status}
                                            className="md:col-span-2"
                                        >
                                            <select
                                                value={data.status}
                                                onChange={(event) =>
                                                    updateStatus(
                                                        event.target.value,
                                                    )
                                                }
                                                className="h-9 w-full rounded-md border border-[#040404]/15 px-3 text-sm text-[#040404] shadow-xs outline-none focus:border-[#faa340] focus:ring-3 focus:ring-[#faa340]/30"
                                            >
                                                {statusOptions.map((option) => (
                                                    <option
                                                        key={option.value}
                                                        value={option.value}
                                                    >
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                        <Field
                                            label="Production area"
                                            error={errors.production_area}
                                            className="md:col-span-2"
                                        >
                                            <Input
                                                value={data.production_area}
                                                onChange={(event) =>
                                                    setData(
                                                        'production_area',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Hot kitchen"
                                            />
                                        </Field>
                                        <Field
                                            label="Start date"
                                            error={errors.planned_start_date}
                                            className="md:col-span-2"
                                        >
                                            <Input
                                                type="date"
                                                value={data.planned_start_date}
                                                onChange={(event) =>
                                                    setData(
                                                        'planned_start_date',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field
                                            label="Target date"
                                            error={errors.target_completion_date}
                                            className="md:col-span-2"
                                        >
                                            <Input
                                                type="date"
                                                value={
                                                    data.target_completion_date
                                                }
                                                onChange={(event) =>
                                                    setData(
                                                        'target_completion_date',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field
                                            label="Completed at"
                                            error={errors.completed_at}
                                            className="md:col-span-4"
                                        >
                                            <div className="flex gap-2">
                                                <Input
                                                    type="datetime-local"
                                                    value={data.completed_at}
                                                    onChange={(event) =>
                                                        setData(
                                                            'completed_at',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setData(
                                                            'completed_at',
                                                            dateTimeLocalNow(),
                                                        )
                                                    }
                                                    className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-[#faa340] px-3 text-sm font-medium text-[#040404] transition hover:text-[#faa340]"
                                                >
                                                    <Clock3 className="size-4" />
                                                    Set now
                                                </button>
                                            </div>
                                        </Field>
                                        <Field
                                            label="Notes"
                                            error={errors.notes}
                                            className="md:col-span-6"
                                        >
                                            <textarea
                                                value={data.notes}
                                                onChange={(event) =>
                                                    setData(
                                                        'notes',
                                                        event.target.value,
                                                    )
                                                }
                                                className="min-h-20 w-full rounded-md border border-[#040404]/15 px-3 py-2 text-sm text-[#040404] shadow-xs outline-none focus:border-[#faa340] focus:ring-3 focus:ring-[#faa340]/30"
                                                placeholder="Production notes"
                                            />
                                        </Field>
                                    </div>
                                </section>
                            </div>

                            <DialogFooter className="mt-5 border-t border-[#040404]/10 pt-4">
                                <button
                                    type="button"
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#040404]/20 px-4 text-sm font-medium text-[#040404] transition hover:text-[#faa340]"
                                    onClick={() => onOpenChange(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-[#faa340] px-4 text-sm font-medium text-[#040404] transition hover:text-[#faa340] disabled:pointer-events-none disabled:opacity-50"
                                >
                                    {processing && (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    )}
                                    {isEditing ? 'Save changes' : 'Create batch'}
                                </button>
                            </DialogFooter>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
