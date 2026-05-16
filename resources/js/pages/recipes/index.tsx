import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Plus, ReceiptText } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { RecipeBomFilters } from './components/recipe-bom-filters';
import { RecipeBomGrid } from './components/recipe-bom-grid';
import { RecipeBomModal } from './components/recipe-bom-modal';
import type {
    PaginatedRecipes,
    RawMaterialOption,
    RecipeBom,
    RecipeFilters as RecipeFiltersType,
    RecipeSummary,
} from './types';

type Props = {
    recipes: PaginatedRecipes;
    filters: RecipeFiltersType;
    summary: RecipeSummary;
    rawMaterialOptions: RawMaterialOption[];
};

const breadcrumbs = [
    {
        title: 'Recipe / BOM',
        href: '/recipes',
    },
];

export default function RecipeBomIndex({
    recipes,
    filters,
    summary,
    rawMaterialOptions,
}: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<RecipeBom | null>(
        null,
    );

    const createRecipe = () => {
        setSelectedRecipe(null);
        setModalOpen(true);
    };

    const editRecipe = (recipe: RecipeBom) => {
        setSelectedRecipe(recipe);
        setModalOpen(true);
    };

    return (
        <>
            <Head title="Recipe / BOM" />

            <main className="min-h-screen p-4 text-[#040404] sm:p-5">
                <section className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-[#040404]/65">
                            <ReceiptText className="size-4" />
                            Menu Item/Product to raw-material BOM
                        </div>
                        <h1 className="mt-0.5 text-xl font-semibold tracking-normal text-[#040404]">
                            Lauan Restaurant Recipe / BOM
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={createRecipe}
                        className="inline-flex h-10 items-center gap-2 rounded-md border border-[#faa340] px-4 text-sm font-semibold text-[#040404] shadow-sm transition hover:text-[#faa340]"
                    >
                        <Plus className="size-4" />
                        Add BOM
                    </button>
                </section>

                <div className="space-y-3">
                    <RecipeBomFilters filters={filters} />
                    <RecipeBomGrid
                        recipes={recipes}
                        filters={filters}
                        summary={summary}
                        onEdit={editRecipe}
                    />
                </div>
            </main>

            <RecipeBomModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                recipe={selectedRecipe}
                rawMaterialOptions={rawMaterialOptions}
            />
        </>
    );
}

RecipeBomIndex.layout = (page: ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
