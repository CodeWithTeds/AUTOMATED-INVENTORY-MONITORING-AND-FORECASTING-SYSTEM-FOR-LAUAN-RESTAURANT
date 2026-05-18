export type InventoryOption = {
    value: string;
    label: string;
};

export type SupplierOption = {
    value: string;
    label: string;
};

export type InventoryItem = {
    id: number;
    sku: string;
    name: string;
    category: string;
    category_label: string;
    supplier: string | null;
    unit: string;
    current_stock: number;
    starting_stock: number;
    stock_in: number;
    stock_out: number;
    ending_stock: number;
    par_level: number;
    reorder_point: number;
    reorder_quantity: number;
    unit_cost: number;
    daily_usage_rate: number;
    lead_time_days: number;
    storage_area: string | null;
    expiration_date: string | null;
    status: string;
    status_label: string;
    stock_state: 'healthy' | 'low' | 'critical' | 'out';
    image_url: string | null;
    notes: string | null;
    created_at: string | null;
    updated_at: string | null;
};

export type InventoryFilters = {
    search?: string;
    category?: string;
    status?: string;
    stock_state?: string;
    storage_area?: string;
    sort?: string;
    direction?: string;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedInventoryItems = {
    data: InventoryItem[];
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

export type InventorySummary = {
    total: number;
    critical: number;
    low: number;
    out: number;
};

export type InventoryFormData = {
    sku: string;
    name: string;
    category: string;
    supplier: string;
    unit: string;
    current_stock: string;
    par_level: string;
    reorder_point: string;
    reorder_quantity: string;
    unit_cost: string;
    daily_usage_rate: string;
    lead_time_days: string;
    storage_area: string;
    expiration_date: string;
    status: string;
    image: File | null;
    notes: string;
};
