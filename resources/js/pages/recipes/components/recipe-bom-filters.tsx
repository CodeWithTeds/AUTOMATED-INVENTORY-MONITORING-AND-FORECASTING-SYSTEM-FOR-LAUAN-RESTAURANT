import { Input } from '@/components/ui/input';
import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { FormEvent, useState } from 'react';
import type { RecipeFilters as RecipeFiltersType } from '../types';

export function RecipeBomFilters({ filters }: { filters: RecipeFiltersType }) {
    const [search, setSearch] = useState(filters.search ?? '');

    const submit = (event: FormEvent) => {
        event.preventDefault();

        router.get(
            '/admin/recipes',
            {
                ...filters,
                search,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <form
            onSubmit={submit}
            className="flex flex-wrap items-center gap-2 border-y border-[#040404]/15 py-2"
        >
            <div className="relative min-w-64 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#040404]/45" />
                <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search menu item, SKU, or raw material"
                    className="pl-9"
                />
            </div>
            <button
                type="submit"
                className="inline-flex h-9 items-center rounded-md border border-[#faa340] px-4 text-sm font-semibold text-[#040404] transition hover:text-[#faa340]"
            >
                Filter
            </button>
        </form>
    );
}
