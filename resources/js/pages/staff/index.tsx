import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowUp,
    LoaderCircle,
    Pencil,
    Plus,
    Search,
    Trash2,
    UsersRound,
} from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
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
import AppLayout from '@/layouts/app-layout';

type Staff = {
    id: number;
    name: string;
    email: string;
    role: string;
    role_label: string;
    email_verified_at: string | null;
    created_at: string | null;
    updated_at: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedStaff = {
    data: Staff[];
    links: PaginationLink[];
    meta: {
        from: number | null;
        to: number | null;
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
};

type StaffFilters = {
    search?: string;
    sort?: string;
    direction?: string;
};

type StaffSummary = {
    total: number;
    verified: number;
    created_this_month: number;
};

type StaffFormData = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

type Props = {
    staff: PaginatedStaff;
    filters: StaffFilters;
    summary: StaffSummary;
};

const breadcrumbs = [
    {
        title: 'Staff',
        href: '/admin/staff',
    },
];

const blankForm: StaffFormData = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
};

function staffToForm(staff: Staff): StaffFormData {
    return {
        name: staff.name,
        email: staff.email,
        password: '',
        password_confirmation: '',
    };
}

function formatDate(value: string | null) {
    if (!value) {
        return 'Pending';
    }

    return new Intl.DateTimeFormat('en', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));
}

function SortButton({
    field,
    label,
    filters,
}: {
    field: string;
    label: string;
    filters: StaffFilters;
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
                    '/admin/staff',
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

function StaffModal({
    open,
    onOpenChange,
    staff,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    staff: Staff | null;
}) {
    const isEditing = staff !== null;
    const defaults = useMemo(
        () => (staff ? staffToForm(staff) : blankForm),
        [staff],
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
    } = useForm<StaffFormData>(defaults);

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
            post(`/admin/staff/${staff.id}`, options);

            return;
        }

        transform((current) => current);
        post('/admin/staff', options);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-2xl">
                <form onSubmit={submit}>
                    <DialogHeader className="border-b border-[#040404]/10 p-5">
                        <DialogTitle className="text-2xl text-[#040404]">
                            {isEditing ? 'Edit staff' : 'Create staff'}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-[#040404]/65">
                            Staff login profile and password access.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 p-5 [&_input]:border-[#040404]/15 [&_input]:text-[#040404] [&_input]:focus-visible:border-[#faa340] [&_input]:focus-visible:ring-[#faa340]/30">
                        <label className="space-y-1.5">
                            <Label className="text-xs font-semibold text-[#040404]/70 uppercase">
                                Name
                            </Label>
                            <Input
                                value={data.name}
                                onChange={(event) =>
                                    setData('name', event.target.value)
                                }
                                placeholder="Juan Dela Cruz"
                            />
                            <InputError message={errors.name} />
                        </label>

                        <label className="space-y-1.5">
                            <Label className="text-xs font-semibold text-[#040404]/70 uppercase">
                                Email
                            </Label>
                            <Input
                                type="email"
                                value={data.email}
                                onChange={(event) =>
                                    setData('email', event.target.value)
                                }
                                placeholder="staff@aimfs.test"
                            />
                            <InputError message={errors.email} />
                        </label>

                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="space-y-1.5">
                                <Label className="text-xs font-semibold text-[#040404]/70 uppercase">
                                    Password
                                </Label>
                                <Input
                                    type="password"
                                    value={data.password}
                                    onChange={(event) =>
                                        setData('password', event.target.value)
                                    }
                                    placeholder={
                                        isEditing
                                            ? 'Leave blank to keep'
                                            : 'Create password'
                                    }
                                    autoComplete="new-password"
                                />
                                <InputError message={errors.password} />
                            </label>

                            <label className="space-y-1.5">
                                <Label className="text-xs font-semibold text-[#040404]/70 uppercase">
                                    Confirm password
                                </Label>
                                <Input
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(event) =>
                                        setData(
                                            'password_confirmation',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Repeat password"
                                    autoComplete="new-password"
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </label>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-[#040404]/10 p-5">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="h-10 rounded-md border border-[#040404]/15 px-4 text-sm font-semibold text-[#040404] transition hover:text-[#faa340]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="inline-flex h-10 items-center gap-2 rounded-md bg-[#faa340] px-4 text-sm font-semibold text-[#040404] shadow-sm transition hover:bg-[#f8992f] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {processing && (
                                <LoaderCircle className="size-4 animate-spin" />
                            )}
                            {isEditing ? 'Save staff' : 'Create staff'}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function StaffIndex({ staff, filters, summary }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
    const [search, setSearch] = useState(filters.search ?? '');

    const createStaff = () => {
        setSelectedStaff(null);
        setModalOpen(true);
    };

    const editStaff = (staffAccount: Staff) => {
        setSelectedStaff(staffAccount);
        setModalOpen(true);
    };

    const submitSearch = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/admin/staff',
            { ...filters, search: search || undefined },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const deleteStaff = (staffAccount: Staff) => {
        if (!confirm(`Delete ${staffAccount.name}'s staff account?`)) {
            return;
        }

        router.delete(`/admin/staff/${staffAccount.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="Staff" />

            <main className="min-h-screen p-4 text-[#040404] sm:p-5">
                <section className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-[#040404]/65">
                            <UsersRound className="size-4" />
                            Admin access and staff logins
                        </div>
                        <h1 className="mt-0.5 text-xl font-semibold tracking-normal text-[#040404]">
                            Staff Management
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={createStaff}
                        className="inline-flex h-10 items-center gap-2 rounded-md border border-[#faa340] px-4 text-sm font-semibold text-[#040404] shadow-sm transition hover:text-[#faa340]"
                    >
                        <Plus className="size-4" />
                        Add staff
                    </button>
                </section>

                <section className="border-y border-[#040404]/15">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#040404]/10 py-2">
                        <div>
                            <h2 className="text-sm font-semibold text-[#040404]">
                                Staff accounts
                            </h2>
                            <p className="text-xs text-[#040404]/60">
                                Showing {staff.meta.from ?? 0}-
                                {staff.meta.to ?? 0} of {staff.meta.total} staff
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[#040404]/70">
                            <span>
                                Total{' '}
                                <strong className="text-[#040404]">
                                    {summary.total}
                                </strong>
                            </span>
                            <span>
                                Verified{' '}
                                <strong className="text-[#faa340]">
                                    {summary.verified}
                                </strong>
                            </span>
                            <span>
                                New this month{' '}
                                <strong className="text-[#040404]">
                                    {summary.created_this_month}
                                </strong>
                            </span>
                        </div>
                    </div>

                    <form
                        onSubmit={submitSearch}
                        className="flex flex-wrap items-center gap-2 border-b border-[#040404]/10 py-2"
                    >
                        <label className="relative min-w-64 flex-1">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#040404]/38" />
                            <Input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search staff"
                                className="h-9 pl-9"
                            />
                        </label>
                        <button
                            type="submit"
                            className="h-9 rounded-md border border-[#040404]/15 px-3 text-sm font-semibold text-[#040404] transition hover:text-[#faa340]"
                        >
                            Search
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setSearch('');
                                router.get(
                                    '/admin/staff',
                                    {},
                                    { preserveState: true, replace: true },
                                );
                            }}
                            className="h-9 rounded-md border border-[#040404]/15 px-3 text-sm font-semibold text-[#040404]/70 transition hover:text-[#040404]"
                        >
                            Reset
                        </button>
                    </form>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-xs">
                            <thead className="text-xs text-[#040404]/65 uppercase">
                                <tr className="border-b border-[#040404]/10">
                                    <th className="px-2 py-1.5">
                                        <SortButton
                                            field="name"
                                            label="Name"
                                            filters={filters}
                                        />
                                    </th>
                                    <th className="px-2 py-1.5">
                                        <SortButton
                                            field="email"
                                            label="Email"
                                            filters={filters}
                                        />
                                    </th>
                                    <th className="px-2 py-1.5">Role</th>
                                    <th className="px-2 py-1.5">
                                        <SortButton
                                            field="created_at"
                                            label="Created"
                                            filters={filters}
                                        />
                                    </th>
                                    <th className="px-2 py-1.5 text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.data.map((staffAccount) => (
                                    <tr
                                        key={staffAccount.id}
                                        className="border-b border-[#040404]/10 align-middle last:border-0"
                                    >
                                        <td className="px-2 py-1.5">
                                            <p className="max-w-56 truncate font-medium text-[#040404]">
                                                {staffAccount.name}
                                            </p>
                                            <p className="text-[11px] text-[#040404]/55">
                                                ID #{staffAccount.id}
                                            </p>
                                        </td>
                                        <td className="px-2 py-1.5 text-[#040404]/75">
                                            {staffAccount.email}
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <Badge
                                                variant="outline"
                                                className="border-[#faa340] px-1.5 py-0 text-[11px] text-[#040404]"
                                            >
                                                {staffAccount.role_label}
                                            </Badge>
                                            <p className="mt-1 text-[11px] text-[#040404]/55">
                                                Verified{' '}
                                                {formatDate(
                                                    staffAccount.email_verified_at,
                                                )}
                                            </p>
                                        </td>
                                        <td className="px-2 py-1.5 text-[#040404]/75">
                                            {formatDate(
                                                staffAccount.created_at,
                                            )}
                                        </td>
                                        <td className="px-2 py-1.5">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    type="button"
                                                    className="inline-grid size-7 place-items-center rounded border border-transparent text-[#040404] transition hover:border-[#faa340] hover:text-[#faa340]"
                                                    onClick={() =>
                                                        editStaff(staffAccount)
                                                    }
                                                    aria-label={`Edit ${staffAccount.name}`}
                                                >
                                                    <Pencil className="size-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    className="inline-grid size-7 place-items-center rounded border border-transparent text-[#040404] transition hover:border-[#faa340] hover:text-[#faa340]"
                                                    onClick={() =>
                                                        deleteStaff(
                                                            staffAccount,
                                                        )
                                                    }
                                                    aria-label={`Delete ${staffAccount.name}`}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}

                                {staff.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-14 text-center text-[#040404]/60"
                                        >
                                            No staff accounts match the current
                                            filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#040404]/10 py-2">
                        <p className="text-xs text-[#040404]/60">
                            Page {staff.meta.current_page} of{' '}
                            {staff.meta.last_page}
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {staff.links.map((link, index) =>
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
            </main>

            <StaffModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                staff={selectedStaff}
            />
        </>
    );
}

StaffIndex.layout = (page: ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
