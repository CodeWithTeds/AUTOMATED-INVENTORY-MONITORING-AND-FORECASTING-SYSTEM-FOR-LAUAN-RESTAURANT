import { Head } from '@inertiajs/react';
import { Plus, Warehouse } from 'lucide-react';
import { useState  } from 'react';
import type {ReactNode} from 'react';
import AppLayout from '@/layouts/app-layout';
import { InventoryFilters } from './components/inventory-filters';
import { InventoryItemModal } from './components/inventory-item-modal';
import { InventoryTable } from './components/inventory-table';
import type {
    InventoryFilters as InventoryFiltersType,
    InventoryItem,
    InventoryOption,
    InventorySummary as InventorySummaryType,
    PaginatedInventoryItems,
    SupplierOption,
} from './types';

type Props = {
    items: PaginatedInventoryItems;
    filters: InventoryFiltersType;
    summary: InventorySummaryType;
    categoryOptions: InventoryOption[];
    supplierOptions: SupplierOption[];
    statusOptions: InventoryOption[];
    stockStateOptions: InventoryOption[];
};

const breadcrumbs = [
    {
        title: 'Inventory',
        href: '/admin/inventory',
    },
];

export default function InventoryIndex({
    items,
    filters,
    summary,
    categoryOptions,
    supplierOptions,
    statusOptions,
    stockStateOptions,
}: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(
        null,
    );

    const createItem = () => {
        setSelectedItem(null);
        setModalOpen(true);
    };

    const editItem = (item: InventoryItem) => {
        setSelectedItem(item);
        setModalOpen(true);
    };

    return (
        <>
            <Head title="Inventory" />

            <main className="min-h-screen p-4 text-[#040404] sm:p-5">
                <section className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-[#040404]/65">
                            <Warehouse className="size-4" />
                            Automated Inventory Monitoring and Forecasting
                        </div>
                        <h1 className="mt-0.5 text-xl font-semibold tracking-normal text-[#040404]">
                            Lauan Restaurant Inventory
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={createItem}
                        className="inline-flex h-10 items-center gap-2 rounded-md border border-[#faa340] px-4 text-sm font-semibold text-[#040404] shadow-sm transition hover:text-[#faa340]"
                    >
                        <Plus className="size-4" />
                        Add product
                    </button>
                </section>

                <div className="space-y-2">
                    <InventoryFilters
                        filters={filters}
                        categoryOptions={categoryOptions}
                        statusOptions={statusOptions}
                        stockStateOptions={stockStateOptions}
                    />
                    <InventoryTable
                        items={items}
                        filters={filters}
                        summary={summary}
                        onEdit={editItem}
                    />
                </div>
            </main>

            <InventoryItemModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                item={selectedItem}
                categoryOptions={categoryOptions}
                supplierOptions={supplierOptions}
                statusOptions={statusOptions}
            />
        </>
    );
}

InventoryIndex.layout = (page: ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
