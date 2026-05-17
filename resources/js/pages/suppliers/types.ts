export type SupplierOption = {
    value: string;
    label: string;
};

export type Supplier = {
    id: number;
    code: string;
    name: string;
    category: string;
    category_label: string;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    city: string | null;
    address: string | null;
    payment_terms: string | null;
    lead_time_days: number;
    rating: number;
    status: string;
    status_label: string;
    notes: string | null;
    created_at: string | null;
    updated_at: string | null;
};

export type SupplierFilters = {
    search?: string;
    category?: string;
    status?: string;
    city?: string;
    rating?: string;
    sort?: string;
    direction?: string;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedSuppliers = {
    data: Supplier[];
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

export type SupplierSummary = {
    total: number;
    preferred: number;
    watchlist: number;
    inactive: number;
    average_lead_time: number;
};

export type SupplierFormData = {
    code: string;
    name: string;
    category: string;
    contact_person: string;
    phone: string;
    email: string;
    city: string;
    address: string;
    payment_terms: string;
    lead_time_days: string;
    rating: string;
    status: string;
    notes: string;
};
