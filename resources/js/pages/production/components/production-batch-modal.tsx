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
import { ImagePlus, LoaderCircle, Utensils } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type {
    ProductionBatch,
    ProductionFormData,
    ProductionOption,
    RawMaterialOption,
} from '../types';

const materialRows = (
    rawMaterialOptions: RawMaterialOption[],
    batch?: ProductionBatch | null,
) =>
    rawMaterialOptions.map((material) => {
        const existing = batch?.materials.find(
            (item) => item.inventory_item_id === material.id,
        );

        return {
            inventory_item_id: String(material.id),
            selected: existing !== undefined,
            quantity: existing ? String(existing.quantity) : '',
            unit: existing?.unit ?? material.unit,
            notes: existing?.notes ?? '',
        };
    });

const blankForm = (
    rawMaterialOptions: RawMaterialOption[],
    statusOptions: ProductionOption[],
): ProductionFormData => ({
    batch_number: '',
    product_name: '',
    product_sku: '',
    product_unit: 'pack',
    selling_price: '0',
    product_image: null,
    planned_quantity: '0',
    completed_quantity: '0',
    waste_quantity: '0',
    production_area: 'Kitchen',
    planned_start_date: '',
    target_completion_date: '',
    completed_at: '',
    status: statusOptions[0]?.value ?? 'planned',
    notes: '',
    materials: materialRows(rawMaterialOptions),
});

const batchToForm = (
    batch: ProductionBatch,
    rawMaterialOptions: RawMaterialOption[],
): ProductionFormData => ({
    batch_number: batch.batch_number,
    product_name: batch.product_name ?? '',
    product_sku: batch.product_sku ?? '',
    product_unit: batch.product_unit ?? 'pack',
    selling_price: String(batch.product_selling_price ?? '0'),
    product_image: null,
    planned_quantity: String(batch.planned_quantity),
    completed_quantity: String(batch.completed_quantity),
    waste_quantity: String(batch.waste_quantity),
    production_area: batch.production_area ?? '',
    planned_start_date: batch.planned_start_date ?? '',
    target_completion_date: batch.target_completion_date ?? '',
    completed_at: batch.completed_at ?? '',
    status: batch.status,
    notes: batch.notes ?? '',
    materials: materialRows(rawMaterialOptions, batch),
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
    rawMaterialOptions,
    statusOptions,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    batch: ProductionBatch | null;
    rawMaterialOptions: RawMaterialOption[];
    statusOptions: ProductionOption[];
}) {
    const isEditing = batch !== null;
    const defaults = useMemo(
        () =>
            batch
                ? batchToForm(batch, rawMaterialOptions)
                : blankForm(rawMaterialOptions, statusOptions),
        [batch, rawMaterialOptions, statusOptions],
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
    const [preview, setPreview] = useState<string | null>(
        batch?.product_image_url ?? null,
    );
    const fieldError = (key: string) =>
        (errors as Record<string, string | undefined>)[key];

    useEffect(() => {
        setData(defaults);
        setPreview(batch?.product_image_url ?? null);
        clearErrors();
    }, [batch?.product_image_url, clearErrors, defaults, setData]);

    const selectImage = (file: File | null) => {
        setData('product_image', file);

        if (!file) {
            setPreview(batch?.product_image_url ?? null);
            return;
        }

        setPreview(URL.createObjectURL(file));
    };

    const updateMaterial = (
        index: number,
        field: keyof ProductionFormData['materials'][number],
        value: string | boolean,
    ) => {
        setData(
            'materials',
            data.materials.map((material, currentIndex) =>
                currentIndex === index
                    ? {
                          ...material,
                          [field]: value,
                      }
                    : material,
            ),
        );
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const selectedMaterials = data.materials
            .filter((material) => material.selected)
            .map((material) => ({
                inventory_item_id: material.inventory_item_id,
                quantity: material.quantity,
                unit: material.unit,
                notes: material.notes,
            }));

        const options = {
            forceFormData: true,
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
                materials: selectedMaterials,
            }));
            post(`/production/${batch.id}`, options);
            return;
        }

        transform((current) => ({
            ...current,
            materials: selectedMaterials,
        }));
        post('/production', options);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-6xl">
                <form onSubmit={submit}>
                    <div className="grid lg:grid-cols-[0.8fr_1.6fr]">
                        <aside className="border-b border-[#040404]/10 p-5 text-[#040404] lg:border-r lg:border-b-0">
                            <DialogHeader>
                                <DialogTitle className="text-2xl text-[#040404]">
                                    {isEditing
                                        ? 'Edit menu production'
                                        : 'Create menu production'}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-[#040404]/65">
                                    Create a sellable menu item and consume raw
                                    materials from inventory.
                                </DialogDescription>
                            </DialogHeader>

                            <label className="mt-5 flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-[#faa340] text-center transition hover:border-[#040404]">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="flex flex-col items-center gap-3 px-8 text-sm font-medium text-[#040404]">
                                        <span className="grid size-14 place-items-center rounded-md border border-[#faa340] text-[#faa340]">
                                            <ImagePlus className="size-7" />
                                        </span>
                                        <span>Upload menu image</span>
                                        <span className="text-xs font-normal text-[#040404]/55">
                                            JPG, PNG, or WEBP up to 2 MB
                                        </span>
                                    </span>
                                )}
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    className="sr-only"
                                    onChange={(event) =>
                                        selectImage(
                                            event.target.files?.[0] ?? null,
                                        )
                                    }
                                />
                            </label>
                            <InputError message={errors.product_image} />

                            <div className="mt-4 rounded-md border border-[#faa340] p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[#040404]">
                                    <Utensils className="size-4 text-[#faa340]" />
                                    POS sellable item
                                </div>
                                <p className="mt-2 text-xs text-[#040404]/60">
                                    This creates the menu product in inventory.
                                    Completed quantity becomes sellable POS
                                    stock.
                                </p>
                            </div>
                        </aside>

                        <div className="p-5 [&_input]:border-[#040404]/15 [&_input]:text-[#040404] [&_input]:focus-visible:border-[#faa340] [&_input]:focus-visible:ring-[#faa340]/30">
                            <div className="mb-5 border-b border-[#040404]/10 pb-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[#040404]">
                                    <Utensils className="size-4 text-[#faa340]" />
                                    Menu item output
                                </div>
                                <p className="mt-1 text-sm text-[#040404]/60">
                                    No product dropdown here. Enter the menu item
                                    you are producing.
                                </p>
                            </div>

                            <div className="space-y-5">
                                <section className="border-b border-[#040404]/10 pb-5">
                                    <h3 className="mb-3 text-xs font-bold tracking-wide text-[#faa340] uppercase">
                                        Sellable item
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
                                            label="Menu item name"
                                            error={errors.product_name}
                                            className="md:col-span-4"
                                        >
                                            <Input
                                                value={data.product_name}
                                                onChange={(event) =>
                                                    setData(
                                                        'product_name',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Chicken Rice Meal"
                                            />
                                        </Field>
                                        <Field
                                            label="SKU"
                                            error={errors.product_sku}
                                            className="md:col-span-2"
                                        >
                                            <Input
                                                value={data.product_sku}
                                                onChange={(event) =>
                                                    setData(
                                                        'product_sku',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Auto if blank"
                                            />
                                        </Field>
                                        <Field
                                            label="Output unit"
                                            error={errors.product_unit}
                                            className="md:col-span-2"
                                        >
                                            <Input
                                                value={data.product_unit}
                                                onChange={(event) =>
                                                    setData(
                                                        'product_unit',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="pack, cup, box"
                                            />
                                        </Field>
                                        <Field
                                            label="POS price"
                                            error={errors.selling_price}
                                            className="md:col-span-2"
                                        >
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.selling_price}
                                                onChange={(event) =>
                                                    setData(
                                                        'selling_price',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="120.00"
                                            />
                                        </Field>
                                    </div>
                                </section>

                                <section className="border-b border-[#040404]/10 pb-5">
                                    <h3 className="mb-3 text-xs font-bold tracking-wide text-[#faa340] uppercase">
                                        Output quantity
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
                                    <h3 className="mb-3 text-xs font-bold tracking-wide text-[#faa340] uppercase">
                                        Raw materials consumed
                                    </h3>
                                    <InputError message={errors.materials} />
                                    <div className="grid gap-2 md:grid-cols-2">
                                        {data.materials.map(
                                            (material, index) => {
                                                const option =
                                                    rawMaterialOptions[index];

                                                return (
                                                    <div
                                                        key={
                                                            material.inventory_item_id
                                                        }
                                                        className="grid gap-3 rounded-md border border-[#040404]/15 p-3 sm:grid-cols-[1fr_100px_76px]"
                                                    >
                                                        <label className="flex items-start gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    material.selected
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateMaterial(
                                                                        index,
                                                                        'selected',
                                                                        event
                                                                            .target
                                                                            .checked,
                                                                    )
                                                                }
                                                                className="mt-1 size-4 accent-[#faa340]"
                                                            />
                                                            <span>
                                                                <span className="block text-sm font-semibold text-[#040404]">
                                                                    {
                                                                        option?.name
                                                                    }
                                                                </span>
                                                                <span className="block font-mono text-[11px] text-[#040404]/50">
                                                                    {
                                                                        option?.sku
                                                                    }{' '}
                                                                    | stock:{' '}
                                                                    {option?.current_stock ??
                                                                        0}{' '}
                                                                    {
                                                                        option?.unit
                                                                    }
                                                                </span>
                                                            </span>
                                                        </label>
                                                        <Field
                                                            label="Consume"
                                                            error={fieldError(
                                                                `materials.${index}.quantity`,
                                                            )}
                                                        >
                                                            <Input
                                                                type="number"
                                                                step="0.01"
                                                                min="0.01"
                                                                disabled={
                                                                    !material.selected
                                                                }
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
                                                                disabled={
                                                                    !material.selected
                                                                }
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
                                                            />
                                                        </Field>
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
                                    {isEditing ? 'Save changes' : 'Create menu'}
                                </button>
                            </DialogFooter>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
