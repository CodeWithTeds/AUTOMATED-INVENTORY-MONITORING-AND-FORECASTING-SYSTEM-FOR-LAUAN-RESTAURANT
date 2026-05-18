import { Head } from '@inertiajs/react';
import { Plus, Truck } from 'lucide-react';
import { useState  } from 'react';
import type {ReactNode} from 'react';
import AppLayout from '@/layouts/app-layout';
import { SupplierFilters } from './components/supplier-filters';
import { SupplierModal } from './components/supplier-modal';
import { SupplierTable } from './components/supplier-table';
import type {
    PaginatedSuppliers,
    Supplier,
    SupplierFilters as SupplierFiltersType,
    SupplierOption,
    SupplierSummary,
} from './types';

type Props = {
    suppliers: PaginatedSuppliers;
    filters: SupplierFiltersType;
    summary: SupplierSummary;
    categoryOptions: SupplierOption[];
    statusOptions: SupplierOption[];
    cityOptions: string[];
};

const breadcrumbs = [
    {
        title: 'Suppliers',
        href: '/admin/suppliers',
    },
];

export default function SuppliersIndex({
    suppliers,
    filters,
    summary,
    categoryOptions,
    statusOptions,
    cityOptions,
}: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
        null,
    );

    const createSupplier = () => {
        setSelectedSupplier(null);
        setModalOpen(true);
    };

    const editSupplier = (supplier: Supplier) => {
        setSelectedSupplier(supplier);
        setModalOpen(true);
    };

    return (
        <>
            <Head title="Suppliers" />

            <main className="min-h-screen p-4 text-[#040404] sm:p-5">
                <section className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-[#040404]/65">
                            <Truck className="size-4" />
                            Vendor sourcing and purchasing readiness
                        </div>
                        <h1 className="mt-0.5 text-xl font-semibold tracking-normal text-[#040404]">
                            Supplier Management
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={createSupplier}
                        className="inline-flex h-10 items-center gap-2 rounded-md border border-[#faa340] px-4 text-sm font-semibold text-[#040404] shadow-sm transition hover:text-[#faa340]"
                    >
                        <Plus className="size-4" />
                        Add supplier
                    </button>
                </section>

                <div className="space-y-2">
                    <SupplierFilters
                        filters={filters}
                        categoryOptions={categoryOptions}
                        statusOptions={statusOptions}
                        cityOptions={cityOptions}
                    />
                    <SupplierTable
                        suppliers={suppliers}
                        filters={filters}
                        summary={summary}
                        onEdit={editSupplier}
                    />
                </div>
            </main>

            <SupplierModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                supplier={selectedSupplier}
                categoryOptions={categoryOptions}
                statusOptions={statusOptions}
            />
        </>
    );
}

SuppliersIndex.layout = (page: ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
