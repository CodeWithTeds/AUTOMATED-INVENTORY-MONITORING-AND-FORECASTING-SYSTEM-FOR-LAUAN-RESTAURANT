import { useForm } from '@inertiajs/react';
import { LoaderCircle, Truck } from 'lucide-react';
import type { FormEvent, ReactNode} from 'react';
import { useEffect, useMemo } from 'react';
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
import type { Supplier, SupplierFormData, SupplierOption } from '../types';

const blankForm = (
    categoryOptions: SupplierOption[],
    statusOptions: SupplierOption[],
): SupplierFormData => ({
    code: '',
    name: '',
    category: categoryOptions[0]?.value ?? '',
    contact_person: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    payment_terms: 'Net 15',
    lead_time_days: '1',
    rating: '3',
    status: statusOptions[1]?.value ?? statusOptions[0]?.value ?? 'active',
    notes: '',
});

const supplierToForm = (supplier: Supplier): SupplierFormData => ({
    code: supplier.code,
    name: supplier.name,
    category: supplier.category,
    contact_person: supplier.contact_person ?? '',
    phone: supplier.phone ?? '',
    email: supplier.email ?? '',
    city: supplier.city ?? '',
    address: supplier.address ?? '',
    payment_terms: supplier.payment_terms ?? '',
    lead_time_days: String(supplier.lead_time_days),
    rating: String(supplier.rating),
    status: supplier.status,
    notes: supplier.notes ?? '',
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

export function SupplierModal({
    open,
    onOpenChange,
    supplier,
    categoryOptions,
    statusOptions,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    supplier: Supplier | null;
    categoryOptions: SupplierOption[];
    statusOptions: SupplierOption[];
}) {
    const isEditing = supplier !== null;
    const defaults = useMemo(
        () =>
            supplier
                ? supplierToForm(supplier)
                : blankForm(categoryOptions, statusOptions),
        [categoryOptions, statusOptions, supplier],
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
    } = useForm<SupplierFormData>(defaults);

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
            transform((current) => ({ ...current, _method: 'put' }));
            post(`/admin/suppliers/${supplier.id}`, options);

            return;
        }

        transform((current) => current);
        post('/admin/suppliers', options);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-5xl">
                <form onSubmit={submit}>
                    <div className="grid lg:grid-cols-[0.75fr_1.55fr]">
                        <aside className="border-b border-[#040404]/10 p-5 text-[#040404] lg:border-r lg:border-b-0">
                            <DialogHeader>
                                <DialogTitle className="text-2xl text-[#040404]">
                                    {isEditing
                                        ? 'Edit supplier'
                                        : 'Create supplier'}
                                </DialogTitle>
                                <DialogDescription className="text-sm text-[#040404]/65">
                                    Supplier profile with contact, payment,
                                    lead-time, rating, and status controls.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="mt-5 grid gap-3 text-sm">
                                <div className="rounded-md border border-[#040404]/15 p-3">
                                    <p className="text-xs font-semibold text-[#040404]/55 uppercase">
                                        Supplier code
                                    </p>
                                    <p className="mt-1 truncate font-semibold">
                                        {data.code || 'Pending'}
                                    </p>
                                </div>
                                <div className="rounded-md border border-[#040404]/15 p-3">
                                    <p className="text-xs font-semibold text-[#040404]/55 uppercase">
                                        Compact report line
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-[#040404]/70">
                                        {data.name || 'Supplier'} /{' '}
                                        {data.city || 'Location'} /{' '}
                                        {data.payment_terms || 'Terms TBD'} /{' '}
                                        {data.lead_time_days || 0}d
                                    </p>
                                </div>
                                <div className="rounded-md border border-[#040404]/15 p-3">
                                    <p className="text-xs font-semibold text-[#040404]/55 uppercase">
                                        Vendor score
                                    </p>
                                    <p className="mt-1 truncate font-semibold">
                                        {data.rating || 3}/5 rating
                                    </p>
                                </div>
                            </div>
                        </aside>

                        <div className="p-5 [&_input]:border-[#040404]/15 [&_input]:text-[#040404] [&_input]:focus-visible:border-[#faa340] [&_input]:focus-visible:ring-[#faa340]/30">
                            <div className="mb-5 flex items-start justify-between gap-3 border-b border-[#040404]/10 pb-4">
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-semibold text-[#040404]">
                                        <Truck className="size-4 text-[#faa340]" />
                                        Supplier details
                                    </div>
                                    <p className="mt-1 text-sm text-[#040404]/60">
                                        Keep vendor records precise for
                                        purchasing, lead-time checks, and
                                        reporting.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-5">
                                <section className="border-b border-[#040404]/10 pb-5">
                                    <h3 className="mb-3 text-xs font-bold tracking-wide text-[#faa340] uppercase">
                                        Identity
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-4">
                                        <Field
                                            label="Code"
                                            error={errors.code}
                                            className="md:col-span-1"
                                        >
                                            <Input
                                                value={
                                                    data.code ||
                                                    'Auto-generated on save'
                                                }
                                                readOnly
                                                className="bg-[#040404]/5 text-[#040404]/70"
                                            />
                                        </Field>
                                        <Field
                                            label="Supplier name"
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
                                                placeholder="Northern Fresh Trading"
                                            />
                                        </Field>
                                        <Field
                                            label="Category"
                                            error={errors.category}
                                            className="md:col-span-2"
                                        >
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
                                                {categoryOptions.map(
                                                    (option) => (
                                                        <option
                                                            key={option.value}
                                                            value={option.value}
                                                        >
                                                            {option.label}
                                                        </option>
                                                    ),
                                                )}
                                            </select>
                                        </Field>
                                        <Field
                                            label="Status"
                                            error={errors.status}
                                            className="md:col-span-2"
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
                                        Contact
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-6">
                                        <Field
                                            label="Contact person"
                                            error={errors.contact_person}
                                            className="md:col-span-2"
                                        >
                                            <Input
                                                value={data.contact_person}
                                                onChange={(event) =>
                                                    setData(
                                                        'contact_person',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Maria Santos"
                                            />
                                        </Field>
                                        <Field
                                            label="Phone"
                                            error={errors.phone}
                                            className="md:col-span-2"
                                        >
                                            <Input
                                                value={data.phone}
                                                onChange={(event) =>
                                                    setData(
                                                        'phone',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="+63 917 000 0000"
                                            />
                                        </Field>
                                        <Field
                                            label="Email"
                                            error={errors.email}
                                            className="md:col-span-2"
                                        >
                                            <Input
                                                type="email"
                                                value={data.email}
                                                onChange={(event) =>
                                                    setData(
                                                        'email',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="orders@example.com"
                                            />
                                        </Field>
                                        <Field
                                            label="City"
                                            error={errors.city}
                                            className="md:col-span-2"
                                        >
                                            <Input
                                                value={data.city}
                                                onChange={(event) =>
                                                    setData(
                                                        'city',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Manila"
                                            />
                                        </Field>
                                        <Field
                                            label="Address"
                                            error={errors.address}
                                            className="md:col-span-4"
                                        >
                                            <Input
                                                value={data.address}
                                                onChange={(event) =>
                                                    setData(
                                                        'address',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Warehouse address"
                                            />
                                        </Field>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="mb-3 text-xs font-bold tracking-wide text-[#faa340] uppercase">
                                        Terms and score
                                    </h3>
                                    <div className="grid gap-4 md:grid-cols-6">
                                        <Field
                                            label="Payment terms"
                                            error={errors.payment_terms}
                                            className="md:col-span-2"
                                        >
                                            <Input
                                                value={data.payment_terms}
                                                onChange={(event) =>
                                                    setData(
                                                        'payment_terms',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Net 15"
                                            />
                                        </Field>
                                        <Field
                                            label="Lead time"
                                            error={errors.lead_time_days}
                                            className="md:col-span-2"
                                        >
                                            <Input
                                                type="number"
                                                min="1"
                                                max="365"
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
                                            label="Rating"
                                            error={errors.rating}
                                            className="md:col-span-2"
                                        >
                                            <Input
                                                type="number"
                                                min="1"
                                                max="5"
                                                value={data.rating}
                                                onChange={(event) =>
                                                    setData(
                                                        'rating',
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
                                                placeholder="Delivery windows, ordering notes, quality concerns"
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
                                        : 'Create supplier'}
                                </button>
                            </DialogFooter>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
