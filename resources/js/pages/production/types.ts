export type ProductionOption = {
    value: string;
    label: string;
    icon?: string;
};

export type MenuItemOption = {
    id: number;
    sku: string;
    name: string;
    unit: string;
    current_stock: number;
    selling_price: number | null;
    image_url: string | null;
    materials: MenuItemMaterialOption[];
};

export type MenuItemMaterialOption = {
    raw_material_id: number;
    name: string | null;
    sku: string | null;
    quantity: number;
    unit: string;
    available_stock: number;
};

export type ProductionBatch = {
    id: number;
    inventory_item_id: number;
    batch_number: string;
    category: string;
    category_label: string;
    category_icon: string;
    product_name: string | null;
    product_sku: string | null;
    product_unit: string | null;
    product_stock: number;
    product_image_url: string | null;
    product_is_menu_item: boolean;
    product_selling_price: number | null;
    planned_quantity: number;
    completed_quantity: number;
    waste_quantity: number;
    portion_size: number;
    portion_unit: string | null;
    stock_synced_quantity: number;
    materials: ProductionMaterial[];
    production_area: string | null;
    planned_start_date: string | null;
    target_completion_date: string | null;
    completed_at: string | null;
    status: string;
    status_label: string;
    notes: string | null;
    created_at: string | null;
    updated_at: string | null;
};

export type ProductionMaterial = {
    id: number;
    inventory_item_id: number;
    name: string | null;
    sku: string | null;
    inventory_unit: string | null;
    available_stock: number;
    quantity: number;
    unit: string;
    stock_synced_quantity: number;
    notes: string | null;
};

export type ProductionFilters = {
    search?: string;
    category?: string;
    status?: string;
    production_area?: string;
    sort?: string;
    direction?: string;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedProductionBatches = {
    data: ProductionBatch[];
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

export type ProductionSummary = {
    total: number;
    planned: number;
    in_progress: number;
    completed: number;
};

export type ProductionFormData = {
    batch_number: string;
    category: string;
    inventory_item_id: string;
    planned_quantity: string;
    completed_quantity: string;
    waste_quantity: string;
    production_area: string;
    planned_start_date: string;
    target_completion_date: string;
    completed_at: string;
    status: string;
    notes: string;
};
