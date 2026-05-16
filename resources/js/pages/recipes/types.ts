export type RecipeMaterial = {
    id: number;
    raw_material_id: number;
    name: string | null;
    sku: string | null;
    inventory_unit: string | null;
    available_stock: number;
    quantity: number;
    unit: string;
    notes: string | null;
};

export type RecipeBom = {
    id: number;
    sku: string;
    name: string;
    unit: string;
    current_stock: number;
    selling_price: number | null;
    image_url: string | null;
    notes: string | null;
    materials: RecipeMaterial[];
    created_at: string | null;
    updated_at: string | null;
};

export type RawMaterialOption = {
    id: number;
    sku: string;
    name: string;
    unit: string;
    current_stock: number;
};

export type RecipeFilters = {
    search?: string;
    sort?: string;
    direction?: string;
};

export type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedRecipes = {
    data: RecipeBom[];
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

export type RecipeSummary = {
    menu_items: number;
    with_bom: number;
    raw_materials: number;
};

export type RecipeFormData = {
    name: string;
    sku: string;
    unit: string;
    selling_price: string;
    image: File | null;
    notes: string;
    materials: RecipeMaterialFormData[];
};

export type RecipeMaterialFormData = {
    raw_material_id: string;
    selected: boolean;
    quantity: string;
    unit: string;
    notes: string;
};
