export type PurchaseOrder = {
    id: number;
    order_number: string;
    supplier_name: string;
    status: string;
    status_label: string;
    items_count: number;
    total_amount: number;
    ordered_at: string | null;
    expected_at: string | null;
    received_at: string | null;
    notes: string | null;
    created_at: string | null;
    updated_at: string | null;
};

export type PurchaseOrderSummary = {
    total: number;
    open: number;
    received: number;
    open_value: number;
};

export type PurchaseOrderOption = {
    value: string;
    label: string;
};

export type PurchaseOrderFilters = {
    search?: string;
    status?: string;
    sort?: string;
    direction?: string;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedPurchaseOrders = {
    data: PurchaseOrder[];
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
