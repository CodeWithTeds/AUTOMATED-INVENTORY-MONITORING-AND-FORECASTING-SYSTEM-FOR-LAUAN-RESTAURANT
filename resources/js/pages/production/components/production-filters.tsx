import { Input } from '@/components/ui/input';
import { router } from '@inertiajs/react';
import { Filter, RotateCcw, Search } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type {
    ProductionFilters as ProductionFiltersType,
    ProductionOption,
} from '../types';

export function ProductionFilters({
    filters,
    statusOptions,
}: {
    filters: ProductionFiltersType;
    statusOptions: ProductionOption[];
}) {
    const [values, setValues] = useState({
        search: filters.search ?? '',
        status: filters.status ?? '',
        production_area: filters.production_area ?? '',
    });

    const applyFilters = (event: FormEvent) => {
        event.preventDefault();
        router.get('/production', values, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setValues({
            search: '',
            status: '',
            production_area: '',
        });
        router.get('/production', {}, { preserveScroll: true, replace: true });
    };

    return (
        <form
            onSubmit={applyFilters}
            className="border-y border-[#040404]/15 py-2"
        >
            <div className="grid gap-2 lg:grid-cols-[minmax(220px,1.4fr)_minmax(150px,0.8fr)_minmax(150px,0.8fr)_auto_auto]">
                <label className="relative">
                    <span className="sr-only">Search production</span>
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
                        placeholder="Search batch, menu item, area"
                        type="search"
                    />
                </label>

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

                <Input
                    value={values.production_area}
                    onChange={(event) =>
                        setValues((current) => ({
                            ...current,
                            production_area: event.target.value,
                        }))
                    }
                    className="h-8 border-[#040404]/15 text-xs text-[#040404] focus-visible:border-[#faa340] focus-visible:ring-[#faa340]/30"
                    placeholder="Production area"
                />

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
