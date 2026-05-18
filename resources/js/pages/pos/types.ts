export type PosProduct = {
    id: number;
    sku: string;
    name: string;
    category: string;
    category_label: string;
    category_icon: string;
    unit: string;
    current_stock: number;
    selling_price: number;
    image_url: string | null;
    updated_at: string | null;
};

export type PosOrderItem = {
    id: number;
    inventory_item_id: number | null;
    item_sku: string | null;
    item_name: string;
    quantity: number;
    unit: string;
    unit_price: number;
    line_total: number;
};

export type PosOrder = {
    id: number;
    order_number: string;
    customer_name: string | null;
    status: string;
    status_label: string;
    payment_method: string;
    payment_method_label: string;
    subtotal_amount: number;
    discount_amount: number;
    tax_amount: number;
    total_amount: number;
    amount_paid: number;
    change_amount: number;
    paid_at: string | null;
    cashier_name: string | null;
    purchase_order_receipt_url?: string | null;
    items: PosOrderItem[];
};

export type PosSummary = {
    orders: number;
    gross_sales: number;
    items_sold: number;
};

export type PaymentMethodOption = {
    value: string;
    label: string;
};

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
};

export type PurchaseOrderSummary = {
    total: number;
    open: number;
    received: number;
    open_value: number;
};

export type PosOrderFormData = {
    customer_name: string;
    payment_method: string;
    amount_paid: string;
    items: {
        inventory_item_id: number;
        quantity: number;
    }[];
};
