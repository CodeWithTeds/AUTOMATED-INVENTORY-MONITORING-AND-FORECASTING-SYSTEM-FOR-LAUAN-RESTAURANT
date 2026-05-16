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
import { ClipboardList, LoaderCircle, Plus, Trash2 } from 'lucide-react';
import { FormEvent, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type {
    ProductionBatch,
    ProductionFormData,
    ProductionOption,
    ProductionProductOption,
} from '../types';

const blankForm = (
    productOptions: ProductionProductOption[],
    statusOptions: ProductionOption[],
): ProductionFormData => ({
    inventory_item_id: productOptions[0]?.id
        ? String(productOptions[0].id)
        : '',
    batch_number: '',
    planned_quantity: '0',
    completed_quantity: '0',
    waste_quantity: '0',
    production_area: 'Kitchen',
    planned_start_date: '',
    target_completion_date: '',
    completed_at: '',
    status: statusOptions[0]?.value ?? 'planned',
    notes: '',
    materials: [
        {
            inventory_item_id: productOptions[0]?.id
                ? String(productOptions[0].id)
                : '',
            quantity: '0',
            unit: productOptions[0]?.unit ?? 'kg',
            notes: '',
        },
    ],
});

const batchToForm = (batch: ProductionBatch): ProductionFormData => ({
    inventory_item_id: String(batch.inventory_item_id),
    batch_number: batch.batch_number,
    planned_quantity: String(batch.planned_quantity),
    completed_quantity: String(batch.completed_quantity),
    waste_quantity: String(batch.waste_quantity),
    production_area: batch.production_area ?? '',
    planned_start_date: batch.planned_start_date ?? '',
    target_completion_date: batch.target_completion_date ?? '',
    completed_at: batch.completed_at ?? '',
    status: batch.status,
    notes: batch.notes ?? '',
    materials: batch.materials.map((material) => ({
        inventory_item_id: String(material.inventory_item_id),
        quantity: String(material.quantity),
        unit: material.unit,
        notes: material.notes ?? '',
    })),
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

export function ProductionBatchModal({
    open,
    onOpenChange,
    batch,
    productOptions,
    statusOptions,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    batch: ProductionBatch | null;
    productOptions: ProductionProductOption[];
    statusOptions: ProductionOption[];
}) {
    const isEditing = batch !== null;
    const defaults = useMemo(
        () =>
            batch
                ? batchToForm(batch)
                : blankForm(productOptions, statusOptions),
        [batch, productOptions, statusOptions],
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

    const selectedProduct = productOptions.find(
        (product) => String(product.id) === data.inventory_item_id,
    );
    const fieldError = (key: string) =>
        (errors as Record<string, string | undefined>)[key];

    useEffect(() => {
        setData(defaults);
        clearErrors();
    }, [clearErrors, defaults, setData]);

    const addMaterial = () => {
        const firstMaterial = productOptions[0];

        setData('materials', [
            ...data.materials,
            {
                inventory_item_id: firstMaterial?.id
                    ? String(firstMaterial.id)
                    : '',
                quantity: '0',
                unit: firstMaterial?.unit ?? 'kg',
                notes: '',
            },
        ]);
    };

    const removeMaterial = (index: number) => {
        setData(
            'materials',
            data.materials.filter((_, currentIndex) => currentIndex !== index),
        );
    };

    const updateMaterial = (
        index: number,
        field: keyof ProductionFormData['materials'][number],
        value: string,
    ) => {
        const materials = data.materials.map((material, currentIndex) => {
            if (currentIndex !== index) {
                return material;
            }

            if (field === 'inventory_item_id') {
                const materialProduct = productOptions.find(
                    (product) => String(product.id) === value,
                );

                return {
                    ...material,
                    inventory_item_id: value,
                    unit: materialProduct?.unit ?? material.unit,
                };
            }

            return {
                ...material,
                [field]: value,
            };
        });

        setData('materials', materials);
    };

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
            transform((current) => ({ ...current, _method: 'put' }));
            post(`/production/${batch.id}`, options);
            return;
        }

        transform((current) => current);
        post('/production', options);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-5xl">
                <form onSubmit={submit}>
                    <div className="grid lg:grid-cols-[0.85fr_1.5fr]">
                        <aside className="border-b border-[#040404]/10 p-5 text-[#040404] lg:border-r lg:border-b-0">
                            <DialogHeader>
                                <DialogTitle className="text-2xl text-[#040404]">
                                    {isEditing
                                        ? 'Edit production'
                                        : 'Create production'}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-[#040404]/65">
                                    Link finished output to one product and add
                                    the raw materials consumed by the batch.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="mt-5 rounded-md border border-[#faa340] p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[#040404]">
                                    <ClipboardList className="size-4 text-[#faa340]" />
                                    Product and raw materials
                                </div>
                                <p className="mt-2 text-xs text-[#040404]/60">
                                    {selectedProduct
                                        ? `${selectedProduct.sku} will receive completed stock. Raw materials below are deducted on completion.`
                                        : 'Choose a product before saving.'}
                                </p>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-md border border-[#040404]/15 p-3">
                                    <p className="text-xs font-semibold text-[#040404]/55 uppercase">
                                        Batch
                                    </p>
                                    <p className="mt-1 truncate font-semibold">
                                        {data.batch_number || 'Pending'}
                                    </p>
                                </div>
                                <div className="rounded-md border border-[#040404]/15 p-3">
                                    <p className="text-xs font-semibold text-[#040404]/55 uppercase">
                                        Status
                                    </p>
                                    <p className="mt-1 truncate font-semibold">
                                        {statusOptions.find(
                                            (option) =>
                                                option.value === data.status,
                                        )?.label ?? 'Planned'}
                                    </p>
                                </div>
                            </div>
                        </aside>

                        <div className="p-5 [&_input]:border-[#040404]/15 [&_input]:text-[#040404] [&_input]:focus-visible:border-[#faa340] [&_input]:focus-visible:ring-[#faa340]/30">
                            <div className="mb-5 border-b border-[#040404]/10 pb-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[#040404]">
                                    <ClipboardList className="size-4 text-[#faa340]" />
                                    Production details
                                </div>
                                <p className="mt-1 text-sm text-[#040404]/60">
                                    Track batch movement from planned output to
                                    completed stock and consumed ingredients.
                                </p>
                            </div>

                            <div className="space-y-5">
                                <section className="border-b border-[#040404]/10 pb-5">
                                    <h3 className="mb-3 text-xs font-bold tracking-wide text-[#faa340] uppercase">
                                        Batch identity
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-4">
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
                                            label="Product"
                                            error={errors.inventory_item_id}
                                            className="md:col-span-2"
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
                                                {productOptions.map(
                                                    (product) => (
                                                        <option
                                                            key={product.id}
                                                            value={product.id}
                                                        >
                                                            {product.name}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </Field>
                                    </div>
                                </section>

                                <section className="border-b border-[#040404]/10 pb-5">
                                    <h3 className="mb-3 text-xs font-bold tracking-wide text-[#faa340] uppercase">
                                        Output
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-4">
                                        <Field
                                            label="Planned qty"
                                            error={errors.planned_quantity}
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
                                            label="Completed qty"
                                            error={errors.completed_quantity}
                                        >
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.completed_quantity}
                                                onChange={(event) =>
                                                    setData(
                                                        'completed_quantity',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </Field>
                                        <Field
                                            label="Waste qty"
                                            error={errors.waste_quantity}
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
                                        <Field
                                            label="Status"
                                            error={errors.status}
                                        >
                                            <select
                                                value={data.status}
                                                onChange={(event) =>
                                                    setData(
                                                        'status',
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
                                    </div>
                                </section>

                                <section className="border-b border-[#040404]/10 pb-5">
                                    <div className="mb-3 flex items-center justify-between gap-2">
                                        <h3 className="text-xs font-bold tracking-wide text-[#faa340] uppercase">
                                            Raw materials
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={addMaterial}
                                            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-[#faa340] px-3 text-xs font-semibold text-[#040404] transition hover:text-[#faa340]"
                                        >
                                            <Plus className="size-3.5" />
                                            Add material
                                        </button>
                                    </div>
                                    <InputError message={errors.materials} />
                                    <div className="space-y-3">
                                        {data.materials.map(
                                            (material, index) => {
                                                const selectedMaterial =
                                                    productOptions.find(
                                                        (product) =>
                                                            String(
                                                                product.id,
                                                            ) ===
                                                            material.inventory_item_id,
                                                    );

                                                return (
                                                    <div
                                                        key={index}
                                                        className="grid gap-3 rounded-md border border-[#040404]/15 p-3 md:grid-cols-[minmax(180px,1.4fr)_minmax(90px,0.5fr)_minmax(80px,0.45fr)_minmax(140px,1fr)_auto]"
                                                    >
                                                        <Field
                                                            label="Material"
                                                            error={fieldError(
                                                                `materials.${index}.inventory_item_id`,
                                                            )}
                                                        >
                                                            <select
                                                                value={
                                                                    material.inventory_item_id
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateMaterial(
                                                                        index,
                                                                        'inventory_item_id',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="h-9 w-full rounded-md border border-[#040404]/15 px-3 text-sm text-[#040404] shadow-xs outline-none focus:border-[#faa340] focus:ring-3 focus:ring-[#faa340]/30"
                                                            >
                                                                {productOptions.map(
                                                                    (
                                                                        product,
                                                                    ) => (
                                                                        <option
                                                                            key={
                                                                                product.id
                                                                            }
                                                                            value={
                                                                                product.id
                                                                            }
                                                                        >
                                                                            {
                                                                                product.name
                                                                            }
                                                                        </option>
                                                                    ),
                                                                )}
                                                            </select>
                                                            <p className="text-[11px] text-[#040404]/50">
                                                                Stock:{' '}
                                                                {selectedMaterial?.current_stock ??
                                                                    0}{' '}
                                                                {selectedMaterial?.unit ??
                                                                    material.unit}
                                                            </p>
                                                        </Field>
                                                        <Field
                                                            label="Quantity"
                                                            error={fieldError(
                                                                `materials.${index}.quantity`,
                                                            )}
                                                        >
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                min="0.01"
                                                                value={
                                                                    material.quantity
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateMaterial(
                                                                        index,
                                                                        'quantity',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                        </Field>
                                                        <Field
                                                            label="Unit"
                                                            error={fieldError(
                                                                `materials.${index}.unit`,
                                                            )}
                                                        >
                                                            <Input
                                                                value={
                                                                    material.unit
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateMaterial(
                                                                        index,
                                                                        'unit',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="g, kg, pcs"
                                                            />
                                                        </Field>
                                                        <Field
                                                            label="Notes"
                                                            error={fieldError(
                                                                `materials.${index}.notes`,
                                                            )}
                                                        >
                                                            <Input
                                                                value={
                                                                    material.notes
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateMaterial(
                                                                        index,
                                                                        'notes',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Trimmed, mixed, packed"
                                                            />
                                                        </Field>
                                                        <div className="flex items-end">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeMaterial(
                                                                        index,
                                                                    )
                                                                }
                                                                disabled={
                                                                    data
                                                                        .materials
                                                                        .length ===
                                                                    1
                                                                }
                                                                className="inline-grid size-9 place-items-center rounded-md border border-[#040404]/15 text-[#040404] transition hover:border-[#faa340] hover:text-[#faa340] disabled:pointer-events-none disabled:opacity-40"
                                                                aria-label="Remove raw material"
                                                            >
                                                                <Trash2 className="size-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="mb-3 text-xs font-bold tracking-wide text-[#faa340] uppercase">
                                        Schedule
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-6">
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
                                            error={
                                                errors.target_completion_date
                                            }
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
                                            className="md:col-span-3"
                                        >
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
                                                placeholder="Recipe run, expected yield, handoff notes"
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
                                    {isEditing
                                        ? 'Save changes'
                                        : 'Create batch'}
                                </button>
                            </DialogFooter>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
