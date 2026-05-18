import { useForm } from '@inertiajs/react';
import { ImagePlus, LoaderCircle, ReceiptText } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode , FormEvent} from 'react';
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
import type {
    RawMaterialOption,
    RecipeBom,
    RecipeFormData,
    RecipeMaterialFormData,
} from '../types';

const materialRows = (
    rawMaterialOptions: RawMaterialOption[],
    recipe?: RecipeBom | null,
): RecipeMaterialFormData[] =>
    rawMaterialOptions.map((material) => {
        const existing = recipe?.materials.find(
            (item) => item.raw_material_id === material.id,
        );

        return {
            raw_material_id: String(material.id),
            selected: existing !== undefined,
            quantity: existing ? String(existing.quantity) : '',
            unit: existing?.unit ?? material.unit,
            notes: existing?.notes ?? '',
        };
    });

const blankForm = (
    rawMaterialOptions: RawMaterialOption[],
): RecipeFormData => ({
    name: '',
    sku: '',
    unit: 'pack',
    selling_price: '0',
    image: null,
    notes: '',
    materials: materialRows(rawMaterialOptions),
});

const recipeToForm = (
    recipe: RecipeBom,
    rawMaterialOptions: RawMaterialOption[],
): RecipeFormData => ({
    name: recipe.name,
    sku: recipe.sku,
    unit: recipe.unit,
    selling_price: String(recipe.selling_price ?? '0'),
    image: null,
    notes: recipe.notes ?? '',
    materials: materialRows(rawMaterialOptions, recipe),
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

export function RecipeBomModal({
    open,
    onOpenChange,
    recipe,
    rawMaterialOptions,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recipe: RecipeBom | null;
    rawMaterialOptions: RawMaterialOption[];
}) {
    const isEditing = recipe !== null;
    const defaults = useMemo(
        () =>
            recipe
                ? recipeToForm(recipe, rawMaterialOptions)
                : blankForm(rawMaterialOptions),
        [recipe, rawMaterialOptions],
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
    } = useForm<RecipeFormData>(defaults);
    const [preview, setPreview] = useState<string | null>(
        recipe?.image_url ?? null,
    );
    const fieldError = (key: string) =>
        (errors as Record<string, string | undefined>)[key];

    useEffect(() => {
        setData(defaults);
        setPreview(recipe?.image_url ?? null);
        clearErrors();
    }, [clearErrors, defaults, recipe?.image_url, setData]);

    const selectImage = (file: File | null) => {
        setData('image', file);

        if (!file) {
            setPreview(recipe?.image_url ?? null);

            return;
        }

        setPreview(URL.createObjectURL(file));
    };

    const updateMaterial = (
        index: number,
        field: keyof RecipeMaterialFormData,
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
                raw_material_id: material.raw_material_id,
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
            post(`/admin/recipes/${recipe.id}`, options);

            return;
        }

        transform((current) => ({
            ...current,
            materials: selectedMaterials,
        }));
        post('/admin/recipes', options);
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
                                        ? 'Edit Recipe / BOM'
                                        : 'Create Recipe / BOM'}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-[#040404]/65">
                                    Define the sellable POS item and the raw
                                    materials needed to produce one unit.
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
                            <InputError message={errors.image} />

                            <div className="mt-4 rounded-md border border-[#faa340] p-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[#040404]">
                                    <ReceiptText className="size-4 text-[#faa340]" />
                                    BOM means per menu item
                                </div>
                                <p className="mt-2 text-xs text-[#040404]/60">
                                    If one Chicken Rice Meal uses 180 g chicken,
                                    enter 180 g here. Production multiplies it
                                    by the batch quantity.
                                </p>
                            </div>
                        </aside>

                        <div className="p-5 [&_input]:border-[#040404]/15 [&_input]:text-[#040404] [&_input]:focus-visible:border-[#faa340] [&_input]:focus-visible:ring-[#faa340]/30">
                            <div className="mb-5 border-b border-[#040404]/10 pb-4">
                                <div className="flex items-center gap-2 text-sm font-semibold text-[#040404]">
                                    <ReceiptText className="size-4 text-[#faa340]" />
                                    Menu Item/Product
                                </div>
                                <p className="mt-1 text-sm text-[#040404]/60">
                                    This becomes the dropdown option in
                                    Production.
                                </p>
                            </div>

                            <div className="space-y-5">
                                <section className="border-b border-[#040404]/10 pb-5">
                                    <h3 className="mb-3 text-xs font-bold tracking-wide text-[#faa340] uppercase">
                                        Sellable item
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-6">
                                        <Field
                                            label="Menu item name"
                                            error={errors.name}
                                            className="md:col-span-3"
                                        >
                                            <Input
                                                value={data.name}
                                                onChange={(event) =>
                                                    setData(
                                                        'name',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Chicken Rice Meal"
                                            />
                                        </Field>
                                        <Field
                                            label="SKU"
                                            error={errors.sku}
                                            className="md:col-span-1"
                                        >
                                            <Input
                                                value={data.sku}
                                                onChange={(event) =>
                                                    setData(
                                                        'sku',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Auto"
                                            />
                                        </Field>
                                        <Field
                                            label="Output unit"
                                            error={errors.unit}
                                            className="md:col-span-1"
                                        >
                                            <Input
                                                value={data.unit}
                                                onChange={(event) =>
                                                    setData(
                                                        'unit',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="pack"
                                            />
                                        </Field>
                                        <Field
                                            label="POS price"
                                            error={errors.selling_price}
                                            className="md:col-span-1"
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
                                                placeholder="149.00"
                                            />
                                        </Field>
                                    </div>
                                </section>

                                <section className="border-b border-[#040404]/10 pb-5">
                                    <h3 className="mb-3 text-xs font-bold tracking-wide text-[#faa340] uppercase">
                                        Raw materials in BOM
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
                                                            material.raw_material_id
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
                                        Notes
                                    </h3>
                                    <Field label="Notes" error={errors.notes}>
                                        <textarea
                                            value={data.notes}
                                            onChange={(event) =>
                                                setData(
                                                    'notes',
                                                    event.target.value,
                                                )
                                            }
                                            className="min-h-20 w-full rounded-md border border-[#040404]/15 px-3 py-2 text-sm text-[#040404] shadow-xs outline-none focus:border-[#faa340] focus:ring-3 focus:ring-[#faa340]/30"
                                            placeholder="Preparation, portioning, or packaging notes"
                                        />
                                    </Field>
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
                                    {isEditing ? 'Save changes' : 'Create BOM'}
                                </button>
                            </DialogFooter>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
