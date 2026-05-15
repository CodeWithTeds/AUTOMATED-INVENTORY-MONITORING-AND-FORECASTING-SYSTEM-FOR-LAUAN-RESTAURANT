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
import { ImagePlus, LoaderCircle, Package } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type {
    InventoryFormData,
    InventoryItem,
    InventoryOption,
} from '../types';

const blankForm = (
    categoryOptions: InventoryOption[],
    statusOptions: InventoryOption[],
): InventoryFormData => ({
    sku: '',
    name: '',
    category: categoryOptions[0]?.value ?? '',
    supplier: '',
    unit: 'kg',
    current_stock: '0',
    par_level: '0',
    reorder_point: '0',
    reorder_quantity: '0',
    unit_cost: '0',
    daily_usage_rate: '0',
    lead_time_days: '1',
    storage_area: 'Kitchen',
    expiration_date: '',
    status: statusOptions[0]?.value ?? 'active',
    image: null,
    notes: '',
});

const itemToForm = (item: InventoryItem): InventoryFormData => ({
    sku: item.sku,
    name: item.name,
    category: item.category,
    supplier: item.supplier ?? '',
    unit: item.unit,
    current_stock: String(item.current_stock),
    par_level: String(item.par_level),
    reorder_point: String(item.reorder_point),
    reorder_quantity: String(item.reorder_quantity),
    unit_cost: String(item.unit_cost),
    daily_usage_rate: String(item.daily_usage_rate),
    lead_time_days: String(item.lead_time_days),
    storage_area: item.storage_area ?? '',
    expiration_date: item.expiration_date ?? '',
    status: item.status,
    image: null,
    notes: item.notes ?? '',
});

function Field({
    label,
    error,
    children,
}: {
    label: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <Label>{label}</Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

export function InventoryItemModal({
    open,
    onOpenChange,
    item,
    categoryOptions,
    statusOptions,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: InventoryItem | null;
    categoryOptions: InventoryOption[];
    statusOptions: InventoryOption[];
}) {
    const isEditing = item !== null;
    const defaults = useMemo(
        () =>
            item ? itemToForm(item) : blankForm(categoryOptions, statusOptions),
        [categoryOptions, item, statusOptions],
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
    } = useForm<InventoryFormData>(defaults);
    const [preview, setPreview] = useState<string | null>(
        item?.image_url ?? null,
    );

    useEffect(() => {
        setData(defaults);
        setPreview(item?.image_url ?? null);
        clearErrors();
    }, [clearErrors, defaults, item, setData]);

    const selectImage = (file: File | null) => {
        setData('image', file);

        if (!file) {
            setPreview(item?.image_url ?? null);
            return;
        }

        setPreview(URL.createObjectURL(file));
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        };

        if (isEditing) {
            transform((current) => ({ ...current, _method: 'put' }));
            post(`/inventory/${item.id}`, options);
            return;
        }

        transform((current) => current);
        post('/inventory', options);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-5xl">
                <form onSubmit={submit}>
                    <div className="grid lg:grid-cols-[0.85fr_1.4fr]">
                        <aside className="border-b border-[#040404]/10 p-5 text-[#040404] lg:border-r lg:border-b-0">
                            <DialogHeader>
                                <DialogTitle className="text-xl text-[#faa340]">
                                    {isEditing
                                        ? 'Edit product'
                                        : 'Create product'}
                                </DialogTitle>
                                <DialogDescription className="text-[#e3dad0]/80">
                                    Lauan Restaurant inventory record with stock
                                    and forecasting controls.
                                </DialogDescription>
                            </DialogHeader>

                            <label className="mt-5 flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed border-[#faa340]/50 text-center transition">
                                {preview ? (
                                    <img
                                        src={preview}
                                        alt=""
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="flex flex-col items-center gap-3 px-8 text-sm text-[#e3dad0]/80">
                                        <span className="grid size-14 place-items-center rounded-md border border-[#faa340] text-[#040404]">
                                            <ImagePlus className="size-7" />
                                        </span>
                                        Upload product image
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
                            <InputError message={errors.image} />

                            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-lg border border-[#040404]/10 p-3">
                                    <p className="text-[#e3dad0]/65">SKU</p>
                                    <p className="mt-1 truncate font-semibold">
                                        {data.sku || 'Pending'}
                                    </p>
                                </div>
                                <div className="rounded-lg border border-[#040404]/10 p-3">
                                    <p className="text-[#e3dad0]/65">Status</p>
                                    <p className="mt-1 truncate font-semibold">
                                        {statusOptions.find(
                                            (option) =>
                                                option.value === data.status,
                                        )?.label ?? 'Active'}
                                    </p>
                                </div>
                            </div>
                        </aside>

                        <div className="p-5 [&_input]:border-[#040404]/15 [&_input]:text-[#040404] [&_input]:focus-visible:border-[#faa340] [&_input]:focus-visible:ring-[#faa340]/30">
                            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-[#040404]/60">
                                <Package className="size-4" />
                                Product details
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="SKU" error={errors.sku}>
                                    <Input
                                        value={data.sku}
                                        onChange={(event) =>
                                            setData('sku', event.target.value)
                                        }
                                        placeholder="LR-KIT-001"
                                    />
                                </Field>
                                <Field label="Product name" error={errors.name}>
                                    <Input
                                        value={data.name}
                                        onChange={(event) =>
                                            setData('name', event.target.value)
                                        }
                                        placeholder="Fresh chicken breast"
                                    />
                                </Field>
                                <Field label="Category" error={errors.category}>
                                    <select
                                        value={data.category}
                                        onChange={(event) =>
                                            setData(
                                                'category',
                                                event.target.value,
                                            )
                                        }
                                        className="h-9 w-full rounded-md border border-[#040404]/15 px-3 text-sm text-[#040404] shadow-xs outline-none focus:border-[#faa340] focus:ring-3 focus:ring-[#faa340]/30"
                                    >
                                        {categoryOptions.map((option) => (
                                            <option
                                                key={option.value}
                                                value={option.value}
                                            >
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Supplier" error={errors.supplier}>
                                    <Input
                                        value={data.supplier}
                                        onChange={(event) =>
                                            setData(
                                                'supplier',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Local market vendor"
                                    />
                                </Field>
                                <Field label="Unit" error={errors.unit}>
                                    <Input
                                        value={data.unit}
                                        onChange={(event) =>
                                            setData('unit', event.target.value)
                                        }
                                        placeholder="kg, pcs, pack"
                                    />
                                </Field>
                                <Field
                                    label="Storage area"
                                    error={errors.storage_area}
                                >
                                    <Input
                                        value={data.storage_area}
                                        onChange={(event) =>
                                            setData(
                                                'storage_area',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Walk-in chiller"
                                    />
                                </Field>
                                <Field
                                    label="Current stock"
                                    error={errors.current_stock}
                                >
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.current_stock}
                                        onChange={(event) =>
                                            setData(
                                                'current_stock',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Par level"
                                    error={errors.par_level}
                                >
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.par_level}
                                        onChange={(event) =>
                                            setData(
                                                'par_level',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Reorder point"
                                    error={errors.reorder_point}
                                >
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.reorder_point}
                                        onChange={(event) =>
                                            setData(
                                                'reorder_point',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Reorder quantity"
                                    error={errors.reorder_quantity}
                                >
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.reorder_quantity}
                                        onChange={(event) =>
                                            setData(
                                                'reorder_quantity',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Unit cost"
                                    error={errors.unit_cost}
                                >
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.unit_cost}
                                        onChange={(event) =>
                                            setData(
                                                'unit_cost',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Daily usage"
                                    error={errors.daily_usage_rate}
                                >
                                    <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.daily_usage_rate}
                                        onChange={(event) =>
                                            setData(
                                                'daily_usage_rate',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Lead time days"
                                    error={errors.lead_time_days}
                                >
                                    <Input
                                        type="number"
                                        min="1"
                                        value={data.lead_time_days}
                                        onChange={(event) =>
                                            setData(
                                                'lead_time_days',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field
                                    label="Expiration date"
                                    error={errors.expiration_date}
                                >
                                    <Input
                                        type="date"
                                        value={data.expiration_date}
                                        onChange={(event) =>
                                            setData(
                                                'expiration_date',
                                                event.target.value,
                                            )
                                        }
                                    />
                                </Field>
                                <Field label="Status" error={errors.status}>
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
                                <Field label="Notes" error={errors.notes}>
                                    <textarea
                                        value={data.notes}
                                        onChange={(event) =>
                                            setData('notes', event.target.value)
                                        }
                                        className="min-h-20 w-full rounded-md border border-[#040404]/15 px-3 py-2 text-sm text-[#040404] shadow-xs outline-none focus:border-[#faa340] focus:ring-3 focus:ring-[#faa340]/30"
                                        placeholder="Handling, supplier terms, prep notes"
                                    />
                                </Field>
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
                                    {isEditing ? 'Save changes' : 'Create item'}
                                </button>
                            </DialogFooter>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
