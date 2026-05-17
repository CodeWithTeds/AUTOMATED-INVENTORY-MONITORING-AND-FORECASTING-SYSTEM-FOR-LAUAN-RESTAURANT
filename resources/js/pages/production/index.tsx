import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { CookingPot, Plus } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { ProductionBatchModal } from './components/production-batch-modal';
import { ProductionFilters } from './components/production-filters';
import { ProductionTable } from './components/production-table';
import type {
    PaginatedProductionBatches,
    MenuItemOption,
    ProductionBatch,
    ProductionFilters as ProductionFiltersType,
    ProductionOption,
    ProductionSummary,
} from './types';

type Props = {
    batches: PaginatedProductionBatches;
    filters: ProductionFiltersType;
    summary: ProductionSummary;
    menuItemOptions: MenuItemOption[];
    statusOptions: ProductionOption[];
};

const breadcrumbs = [
    {
        title: 'Production',
        href: '/admin/production',
    },
];

export default function ProductionIndex({
    batches,
    filters,
    summary,
    menuItemOptions,
    statusOptions,
}: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<ProductionBatch | null>(
        null,
    );

    const createBatch = () => {
        setSelectedBatch(null);
        setModalOpen(true);
    };

    const editBatch = (batch: ProductionBatch) => {
        setSelectedBatch(batch);
        setModalOpen(true);
    };

    return (
        <>
            <Head title="Production" />

            <main className="min-h-screen p-4 text-[#040404] sm:p-5">
                <section className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-[#040404]/65">
                            <CookingPot className="size-4" />
                            Production consumes Recipe / BOM materials
                        </div>
                        <h1 className="mt-0.5 text-xl font-semibold tracking-normal text-[#040404]">
                            Lauan Restaurant Menu Production
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={createBatch}
                        className="inline-flex h-10 items-center gap-2 rounded-md border border-[#faa340] px-4 text-sm font-semibold text-[#040404] shadow-sm transition hover:text-[#faa340]"
                    >
                        <Plus className="size-4" />
                        Add batch
                    </button>
                </section>

                <div className="space-y-2">
                    <ProductionFilters
                        filters={filters}
                        statusOptions={statusOptions}
                    />
                    <ProductionTable
                        batches={batches}
                        filters={filters}
                        summary={summary}
                        onEdit={editBatch}
                    />
                </div>
            </main>

            <ProductionBatchModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                batch={selectedBatch}
                menuItemOptions={menuItemOptions}
                statusOptions={statusOptions}
            />
        </>
    );
}

ProductionIndex.layout = (page: ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
