import { router } from '@inertiajs/react';
import { Filter, RotateCcw, Search } from 'lucide-react';
import type { FormEvent} from 'react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import type {
    SupplierFilters as SupplierFiltersType,
    SupplierOption,
} from '../types';

export function SupplierFilters({
    filters,
    categoryOptions,
    statusOptions,
    cityOptions,
}: {
    filters: SupplierFiltersType;
    categoryOptions: SupplierOption[];
    statusOptions: SupplierOption[];
    cityOptions: string[];
}) {
    const [values, setValues] = useState({
        search: filters.search ?? '',
        category: filters.category ?? '',
        status: filters.status ?? '',
        city: filters.city ?? '',
        rating: filters.rating ?? '',
    });

    const applyFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get('/admin/suppliers', values, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setValues({
            search: '',
            category: '',
            status: '',
            city: '',
            rating: '',
        });
        router.get(
            '/admin/suppliers',
            {},
            { preserveScroll: true, replace: true },
        );
    };

    return (
        <form
            onSubmit={applyFilters}
            className="border-y border-[#040404]/15 py-2"
        >
            <div className="grid gap-2 lg:grid-cols-[minmax(220px,1.3fr)_repeat(4,minmax(130px,0.7fr))_auto_auto]">
                <label className="relative">
                    <span className="sr-only">Search suppliers</span>
                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#040404]/45" />
                    <Input
                        value={values.search}
                        onChange={(event) =>
                            setValues((current) => ({
                                ...current,
                                search: event.target.value,
                            }))
                        }
                        className="h-8 border-[#040404]/15 pl-9 text-xs text-[#040404] focus-visible:border-[#faa340] focus-visible:ring-[#faa340]/30"
                        placeholder="Search code, name, contact, email"
                        type="search"
                    />
                </label>

                <select
                    value={values.category}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            category: event.target.value,
                        }))
                    }
                    className="h-8 rounded-md border border-[#040404]/15 px-2 text-xs text-[#040404] shadow-xs outline-none focus:border-[#faa340] focus:ring-3 focus:ring-[#faa340]/30"
                    aria-label="Filter by category"
                >
                    <option value="">All categories</option>
                    {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <select
                    value={values.status}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            status: event.target.value,
                        }))
                    }
                    className="h-8 rounded-md border border-[#040404]/15 px-2 text-xs text-[#040404] shadow-xs outline-none focus:border-[#faa340] focus:ring-3 focus:ring-[#faa340]/30"
                    aria-label="Filter by status"
                >
                    <option value="">All statuses</option>
                    {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <select
                    value={values.city}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            city: event.target.value,
                        }))
                    }
                    className="h-8 rounded-md border border-[#040404]/15 px-2 text-xs text-[#040404] shadow-xs outline-none focus:border-[#faa340] focus:ring-3 focus:ring-[#faa340]/30"
                    aria-label="Filter by city"
                >
                    <option value="">All locations</option>
                    {cityOptions.map((city) => (
                        <option key={city} value={city}>
                            {city}
                        </option>
                    ))}
                </select>

                <select
                    value={values.rating}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            rating: event.target.value,
                        }))
                    }
                    className="h-8 rounded-md border border-[#040404]/15 px-2 text-xs text-[#040404] shadow-xs outline-none focus:border-[#faa340] focus:ring-3 focus:ring-[#faa340]/30"
                    aria-label="Filter by minimum rating"
                >
                    <option value="">Any rating</option>
                    <option value="5">5 only</option>
                    <option value="4">4 and up</option>
                    <option value="3">3 and up</option>
                </select>

                <button
                    type="submit"
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#040404] px-3 text-xs font-medium text-[#faa340] transition hover:text-[#040404]"
                >
                    <Filter className="size-4" />
                    Filter
                </button>

                <button
                    type="button"
                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-[#040404]/20 px-3 text-xs font-medium text-[#040404] transition hover:text-[#faa340]"
                    onClick={clearFilters}
                >
                    <RotateCcw className="size-4" />
                    Reset
                </button>
            </div>
        </form>
    );
}
