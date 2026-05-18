import { Head, useForm, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    Banknote,
    CheckCircle2,
    Clock3,
    Download,
    ImageIcon,
    Minus,
    PackageCheck,
    Plus,
    ReceiptText,
    Search,
    Trash2,
    UserRound,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import type {
    PaymentMethodOption,
    PosOrder,
    PosOrderFormData,
    PosProduct,
    PosSummary,
    PurchaseOrder,
} from './types';

type Props = {
    products: PosProduct[];
    recentOrders: PosOrder[];
    purchaseOrders: PurchaseOrder[];
    summary: PosSummary;
    paymentMethodOptions: PaymentMethodOption[];
};

type FlashProps = {
    success?: string | null;
    receipt?: PosOrder | null;
};

type CartLine = {
    productId: number;
    quantity: number;
};

type CategoryTile = {
    value: string;
    label: string;
    icon: string;
    count: number;
};

const breadcrumbs = [
    {
        title: 'POS',
        href: '/admin/pos',
    },
];

const peso = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
});

const number = new Intl.NumberFormat('en-PH', {
    maximumFractionDigits: 2,
});

function money(value: number) {
    return peso.format(value);
}

function orderTone(index: number) {
    const tones = [
        'bg-[#fb4856] text-white',
        'bg-[#0f62da] text-white',
        'bg-[#fbc02d] text-white',
        'bg-[#8b5cf6] text-white',
    ];

    return tones[index % tones.length];
}

export default function PosIndex({
    products: initialProducts,
    purchaseOrders,
    summary,
    paymentMethodOptions,
}: Props) {
    const { props } = usePage();
    const flash = props.flash as FlashProps | undefined;
    const [products, setProducts] = useState(initialProducts);
    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all_menu');
    const [cart, setCart] = useState<CartLine[]>([]);
    const [dismissedReceiptNumber, setDismissedReceiptNumber] = useState('');
    const [dismissedToastKey, setDismissedToastKey] = useState('');
    const [lastSyncedAt, setLastSyncedAt] = useState(() => new Date());
    const firstPaymentMethod = paymentMethodOptions[0]?.value ?? 'cash';
    const { data, setData, post, processing, errors, clearErrors } =
        useForm<PosOrderFormData>({
            customer_name: '',
            payment_method: firstPaymentMethod,
            amount_paid: '',
            items: [],
        });

    const productById = useMemo(
        () => new Map(products.map((product) => [product.id, product])),
        [products],
    );
    const categories = useMemo<CategoryTile[]>(() => {
        const categoryMap = new Map<string, CategoryTile>();

        products.forEach((product) => {
            const existing = categoryMap.get(product.category);
            categoryMap.set(product.category, {
                value: product.category,
                label: product.category_label,
                icon: product.category_icon,
                count: (existing?.count ?? 0) + 1,
            });
        });

        return [
            {
                value: 'all_menu',
                label: 'All Menu',
                icon: '🍽️',
                count: products.length,
            },
            ...Array.from(categoryMap.values()).filter(
                (category) => category.value !== 'all_menu',
            ),
        ];
    }, [products]);
    const filteredProducts = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return products.filter((product) => {
            const matchesCategory =
                selectedCategory === 'all_menu' ||
                product.category === selectedCategory;
            const matchesQuery =
                !normalizedQuery ||
                `${product.name} ${product.sku}`
                    .toLowerCase()
                    .includes(normalizedQuery);

            return matchesCategory && matchesQuery;
        });
    }, [products, query, selectedCategory]);
    const cartLines = cart.map((line) => ({
        ...line,
        product: productById.get(line.productId) ?? null,
    }));
    const subtotal = cartLines.reduce(
        (total, line) =>
            total + (line.product?.selling_price ?? 0) * line.quantity,
        0,
    );
    const amountPaid = Number.parseFloat(data.amount_paid || '0');
    const hasUnavailableLines = cartLines.some(
        (line) => !line.product || line.quantity > line.product.current_stock,
    );
    const flashReceipt = flash?.receipt ?? null;
    const flashToastKey = flashReceipt?.order_number ?? flash?.success ?? '';
    const receipt =
        flashReceipt && dismissedReceiptNumber !== flashReceipt.order_number
            ? flashReceipt
            : null;
    const toastMessage =
        flash?.success && dismissedToastKey !== flashToastKey
            ? flash.success
            : '';

    useEffect(() => {
        setData('payment_method', firstPaymentMethod);
    }, [firstPaymentMethod, setData]);

    useEffect(() => {
        setData(
            'items',
            cart.map((line) => ({
                inventory_item_id: line.productId,
                quantity: line.quantity,
            })),
        );
    }, [cart, setData]);

    useEffect(() => {
        if (!toastMessage || !flashToastKey) {
            return;
        }

        const timer = window.setTimeout(
            () => setDismissedToastKey(flashToastKey),
            5000,
        );

        return () => window.clearTimeout(timer);
    }, [flashToastKey, toastMessage]);

    useEffect(() => {
        const loadProducts = async () => {
            const response = await fetch('/admin/pos/products', {
                credentials: 'same-origin',
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });

            if (!response.ok) {
                return;
            }

            const payload = (await response.json()) as {
                products: PosProduct[];
            };
            setProducts(payload.products);
            setLastSyncedAt(new Date());
        };

        const timer = window.setInterval(loadProducts, 5000);

        return () => window.clearInterval(timer);
    }, []);

    const quantityInCart = (productId: number) =>
        cart.find((line) => line.productId === productId)?.quantity ?? 0;

    const addProduct = (product: PosProduct) => {
        clearErrors();
        setCart((current) => {
            const existing = current.find((line) => line.productId === product.id);

            if (existing) {
                return current.map((line) =>
                    line.productId === product.id
                        ? {
                              ...line,
                              quantity: Math.min(
                                  line.quantity + 1,
                                  product.current_stock,
                              ),
                          }
                        : line,
                );
            }

            return [...current, { productId: product.id, quantity: 1 }];
        });
    };

    const changeQuantity = (productId: number, quantity: number) => {
        clearErrors();
        setCart((current) =>
            current
                .map((line) =>
                    line.productId === productId
                        ? { ...line, quantity: Math.max(0, quantity) }
                        : line,
                )
                .filter((line) => line.quantity > 0),
        );
    };

    const submitOrder = (event: FormEvent) => {
        event.preventDefault();

        if (cart.length === 0 || hasUnavailableLines) {
            return;
        }

        post('/admin/pos/orders', {
            preserveScroll: true,
            onSuccess: () => {
                setCart([]);
                setData({
                    customer_name: '',
                    payment_method: data.payment_method,
                    amount_paid: '',
                    items: [],
                });
            },
        });
    };

    return (
        <>
            <Head title="POS" />

            {(toastMessage || receipt) && (
                <div className="fixed top-4 right-4 z-50 w-[min(360px,calc(100vw-2rem))] space-y-3">
                    {toastMessage && (
                        <div className="flex items-start gap-3 border border-[#2ec66d]/20 bg-white p-3 shadow-lg">
                            <span className="grid size-9 shrink-0 place-items-center bg-[#2ec66d] text-white">
                                <CheckCircle2 className="size-5" />
                            </span>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-[#040404]">
                                    Successful cash order
                                </p>
                                <p className="mt-0.5 text-xs text-[#040404]/55">
                                    {toastMessage}
                                </p>
                                {receipt?.purchase_order_receipt_url && (
                                    <a
                                        href={
                                            receipt.purchase_order_receipt_url
                                        }
                                        className="mt-2 inline-flex h-7 items-center gap-1.5 border border-[#2ec66d] px-2 text-xs font-semibold text-[#040404] transition hover:text-[#2ec66d]"
                                    >
                                        <Download className="size-3.5" />
                                        Download receipt
                                    </a>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() =>
                                    setDismissedToastKey(flashToastKey)
                                }
                                className="grid size-7 shrink-0 place-items-center text-[#040404]/45 hover:text-[#040404]"
                                aria-label="Dismiss order success toast"
                            >
                                <X className="size-4" />
                            </button>
                        </div>
                    )}

                    {receipt && (
                        <article className="bg-[#f7f4ee] px-5 py-4 font-mono text-[#111] shadow-2xl">
                            <div className="flex items-start justify-between gap-3">
                                <div className="text-center">
                                    <p className="text-base font-bold tracking-[0.16em]">
                                        CASH RECEIPT
                                    </p>
                                    <p className="mt-1 text-[11px]">
                                        Lauan POS
                                    </p>
                                    <p className="text-[11px]">
                                        Cash only counter
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setDismissedReceiptNumber(
                                            receipt.order_number,
                                        )
                                    }
                                    className="grid size-7 shrink-0 place-items-center text-[#111]/45 hover:text-[#111]"
                                    aria-label="Close receipt"
                                >
                                    <X className="size-4" />
                                </button>
                            </div>

                            <div className="my-3 border-t border-b border-dashed border-[#111]/35 py-2 text-[11px]">
                                <div className="flex justify-between gap-3">
                                    <span>Date:</span>
                                    <span>{receipt.paid_at ?? 'Just now'}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span>No:</span>
                                    <span>{receipt.order_number}</span>
                                </div>
                                <div className="flex justify-between gap-3">
                                    <span>Name:</span>
                                    <span className="truncate">
                                        {receipt.customer_name ?? 'Walk-in'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1 text-[11px]">
                                {receipt.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="grid grid-cols-[34px_minmax(0,1fr)_auto] gap-2"
                                    >
                                        <span>
                                            {number.format(item.quantity)}x
                                        </span>
                                        <span className="truncate">
                                            {item.item_name}
                                        </span>
                                        <span>{money(item.line_total)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 border-t border-dashed border-[#111]/35 pt-2 text-[11px]">
                                <div className="flex justify-between">
                                    <span>Sub-total</span>
                                    <span>{money(receipt.subtotal_amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Cash</span>
                                    <span>{money(receipt.amount_paid)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Change</span>
                                    <span>{money(receipt.change_amount)}</span>
                                </div>
                                <div className="mt-2 flex justify-between text-base font-bold">
                                    <span>Total</span>
                                    <span>{money(receipt.total_amount)}</span>
                                </div>
                            </div>

                            <p className="mt-4 text-center text-lg font-bold tracking-[0.16em]">
                                THANK YOU
                            </p>
                            {receipt.purchase_order_receipt_url && (
                                <a
                                    href={receipt.purchase_order_receipt_url}
                                    className="mt-3 inline-flex h-8 w-full items-center justify-center gap-1.5 border border-[#111]/45 text-[11px] font-bold tracking-normal transition hover:bg-[#111] hover:text-[#f7f4ee]"
                                >
                                    <Download className="size-3.5" />
                                    DOWNLOAD RECEIPT
                                </a>
                            )}
                            <div className="mt-2 flex h-10 items-end justify-center gap-[3px]">
                                {Array.from({ length: 34 }).map((_, index) => (
                                    <span
                                        key={index}
                                        className="w-[2px] bg-[#111]"
                                        style={{
                                            height: `${18 + ((index * 7) % 21)}px`,
                                        }}
                                    />
                                ))}
                            </div>
                        </article>
                    )}
                </div>
            )}

            <main className="min-h-screen text-[#040404]">
                <header className="sticky top-0 z-20 border-b border-[#040404]/8 bg-white px-4 py-3 sm:px-6">
                    <div className="grid items-center gap-3 xl:grid-cols-[210px_minmax(260px,1fr)_auto]">
                        <h1 className="text-2xl font-bold tracking-normal">
                            Lauan <span className="text-[#2ec66d]">POS</span>
                        </h1>
                        <label className="relative max-w-xl">
                            <span className="sr-only">Search menu</span>
                            <Search className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-[#040404]/35" />
                            <Input
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                                className="h-11 border-0 bg-[#eef2f3] pl-12 text-sm shadow-none focus-visible:ring-[#2ec66d]/20"
                                placeholder="Search Menu"
                                type="search"
                            />
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="grid size-10 place-items-center rounded-full bg-[#eef2f3] text-sm font-bold text-[#2ec66d]">
                                POS
                            </div>
                            <div>
                                <p className="text-sm font-semibold">
                                    Active Cashier
                                </p>
                                <p className="text-xs text-[#040404]/45">
                                    Synced{' '}
                                    {lastSyncedAt.toLocaleTimeString('en-PH', {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                            <span className="size-2 rounded-full bg-[#fb4856]" />
                        </div>
                    </div>
                </header>

                <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_390px]">
                    <section className="min-w-0 px-4 py-5 sm:px-6">
                        <div className="mb-5">
                            <section>
                                <div className="mb-3 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold">
                                        Order List
                                    </h2>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            className="grid size-8 place-items-center rounded-md bg-white text-[#040404] shadow-sm"
                                            aria-label="Previous orders"
                                        >
                                            ‹
                                        </button>
                                        <button
                                            type="button"
                                            className="grid size-8 place-items-center rounded-md bg-white text-[#040404] shadow-sm"
                                            aria-label="Next orders"
                                        >
                                            ›
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-5 overflow-x-auto pb-2">
                                    {purchaseOrders
                                        .slice(0, 4)
                                        .map((order, index) => (
                                        <article
                                            key={order.id}
                                            className="flex min-w-56 items-center gap-3"
                                        >
                                            <span
                                                className={`grid size-12 shrink-0 place-items-center text-lg font-bold ${orderTone(index)}`}
                                            >
                                                T{index + 6}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate font-semibold">
                                                    {order.customer_name ??
                                                        'Walk-in'}
                                                </p>
                                                <p className="text-sm text-[#040404]/45">
                                                    {order.items_count} items
                                                </p>
                                            </div>
                                            <ArrowRight className="size-5 shrink-0" />
                                            <Badge className="border-0 bg-[#faa340] text-[#040404] hover:bg-[#faa340]">
                                                {order.status_label}
                                            </Badge>
                                        </article>
                                        ))}

                                    {purchaseOrders.length === 0 && (
                                        <article className="flex min-w-56 items-center gap-3">
                                            <span className="grid size-12 place-items-center bg-[#2ec66d] text-lg font-bold text-white">
                                                T1
                                            </span>
                                            <div>
                                                <p className="font-semibold">
                                                    No active orders
                                                </p>
                                                <p className="text-sm text-[#040404]/45">
                                                    Start a new sale
                                                </p>
                                            </div>
                                        </article>
                                    )}
                                </div>
                            </section>
                        </div>

                        <section className="mb-5">
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="text-xl font-semibold">
                                    Categories
                                </h2>
                                <p className="text-sm text-[#040404]/45">
                                    {products.length} sellable items
                                </p>
                            </div>
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {categories.map((category) => {
                                    const active =
                                        selectedCategory === category.value;

                                    return (
                                        <button
                                            key={category.value}
                                            type="button"
                                            onClick={() =>
                                                setSelectedCategory(
                                                    category.value,
                                                )
                                            }
                                            className={`grid h-16 w-24 shrink-0 content-center gap-1 border p-2 text-left transition ${
                                                active
                                                    ? 'border-[#2ec66d] bg-[#2ec66d] text-white shadow-md shadow-[#2ec66d]/20'
                                                    : 'border-[#040404]/10 bg-white text-[#040404] hover:border-[#2ec66d]'
                                            }`}
                                        >
                                            <span className="text-base leading-none">
                                                {category.icon}
                                            </span>
                                            <span className="truncate text-xs font-medium">
                                                {category.label}
                                            </span>
                                            <span
                                                className={`text-[11px] leading-none ${active ? 'text-white' : 'text-[#040404]/45'}`}
                                            >
                                                {category.count} items
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <section>
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="text-xl font-semibold">
                                    Special menu for you
                                </h2>
                                <span className="text-sm text-[#040404]/45">
                                    Today {summary.orders} orders,{' '}
                                    {money(summary.gross_sales)}
                                </span>
                            </div>
                            <div className="grid max-h-[575px] grid-cols-1 gap-x-5 gap-y-4 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-4">
                                {filteredProducts.map((product, index) => {
                                    const selectedQuantity = quantityInCart(
                                        product.id,
                                    );
                                    const remainingStock =
                                        product.current_stock - selectedQuantity;

                                    return (
                                        <button
                                            key={product.id}
                                            type="button"
                                            onClick={() => addProduct(product)}
                                            disabled={remainingStock <= 0}
                                            className="group overflow-hidden rounded-none bg-white text-left transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55"
                                        >
                                            <div className="relative aspect-[1.48] bg-[#eef2f3]">
                                                {product.image_url ? (
                                                    <img
                                                        src={product.image_url}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <span className="grid h-full w-full place-items-center text-[#040404]/35">
                                                        <ImageIcon className="size-10" />
                                                    </span>
                                                )}
                                                {index % 3 === 1 && (
                                                    <span className="absolute top-2 left-2 bg-[#8b5cf6] px-2 py-1 text-[11px] font-semibold text-white">
                                                        20% OFF
                                                    </span>
                                                )}
                                                {index % 4 === 0 && (
                                                    <span className="absolute right-2 bottom-2 bg-[#fb4856] px-2 py-1 text-[11px] font-semibold text-white">
                                                        Recommendation
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-2.5">
                                                <p className="line-clamp-2 min-h-10 text-sm font-medium text-[#040404]/62">
                                                    {product.name}
                                                </p>
                                                <div className="mt-2 flex items-end justify-between gap-3">
                                                    <div>
                                                        <p className="text-xl font-semibold text-[#040404]">
                                                            {money(
                                                                product.selling_price,
                                                            )}
                                                        </p>
                                                        <p className="mt-1 text-xs text-[#040404]/45">
                                                            {number.format(
                                                                remainingStock,
                                                            )}{' '}
                                                            {product.unit} left
                                                        </p>
                                                    </div>
                                                    <span className="grid size-8 place-items-center rounded-full bg-[#2ec66d] text-white transition group-hover:bg-[#27b765]">
                                                        <Plus className="size-4" />
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}

                                {filteredProducts.length === 0 && (
                                    <div className="col-span-full rounded-md border border-dashed border-[#040404]/15 bg-white py-16 text-center text-sm text-[#040404]/50">
                                        No completed production items are
                                        currently available for this category.
                                    </div>
                                )}
                            </div>
                        </section>
                    </section>

                    <form
                        onSubmit={submitOrder}
                        className="min-h-[calc(100vh-69px)] border-l border-[#040404]/10 bg-white px-5 py-6 xl:sticky xl:top-[69px] xl:self-start"
                    >
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                Order Details
                            </h2>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setCart([])}
                                    disabled={cart.length === 0}
                                    className="grid size-8 place-items-center rounded-md text-[#040404]/50 hover:bg-[#fbf8f5] hover:text-[#faa340] disabled:opacity-30"
                                    aria-label="Clear order"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        </div>

                        <label className="mb-5 block">
                            <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[#040404]/55">
                                <UserRound className="size-3.5" />
                                Recipient
                            </span>
                            <Input
                                value={data.customer_name}
                                onChange={(event) =>
                                    setData('customer_name', event.target.value)
                                }
                                className="h-10 border-[#040404]/10 text-sm focus-visible:border-[#faa340] focus-visible:ring-[#faa340]/20"
                                placeholder="Walk-in customer"
                            />
                            {errors.customer_name && (
                                <p className="mt-1 text-xs text-red-600">
                                    {errors.customer_name}
                                </p>
                            )}
                        </label>

                        <div className="space-y-4 border-y border-[#040404]/10 py-4">
                            {cartLines.map((line) => {
                                const product = line.product;

                                return (
                                    <div
                                        key={line.productId}
                                        className="grid grid-cols-[42px_minmax(0,1fr)_auto] gap-3"
                                    >
                                        <span className="grid size-10 place-items-center bg-[#040404] text-sm font-bold text-white">
                                            {number.format(line.quantity)}X
                                        </span>
                                        <div className="min-w-0">
                                            <p className="line-clamp-2 text-sm font-semibold">
                                                {product?.name ??
                                                    'Unavailable product'}
                                            </p>
                                            <p className="mt-1 text-xs text-[#040404]/45">
                                                {money(
                                                    product?.selling_price ?? 0,
                                                )}{' '}
                                                each
                                            </p>
                                            {product &&
                                                line.quantity >
                                                    product.current_stock && (
                                                    <p className="mt-1 text-xs text-red-600">
                                                        Only{' '}
                                                        {number.format(
                                                            product.current_stock,
                                                        )}{' '}
                                                        {product.unit} left
                                                    </p>
                                                )}
                                            <div className="mt-2 flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        changeQuantity(
                                                            line.productId,
                                                            line.quantity - 1,
                                                        )
                                                    }
                                                    className="grid size-7 place-items-center rounded bg-[#fbf8f5] text-[#040404] hover:text-[#faa340]"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus className="size-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        changeQuantity(
                                                            line.productId,
                                                            line.quantity + 1,
                                                        )
                                                    }
                                                    disabled={
                                                        !product ||
                                                        line.quantity >=
                                                            product.current_stock
                                                    }
                                                    className="grid size-7 place-items-center rounded bg-[#fbf8f5] text-[#040404] hover:text-[#faa340] disabled:opacity-35"
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus className="size-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <strong className="text-sm">
                                            {money(
                                                (product?.selling_price ?? 0) *
                                                    line.quantity,
                                            )}
                                        </strong>
                                    </div>
                                );
                            })}

                            {cart.length === 0 && (
                                <div className="py-12 text-center text-sm text-[#040404]/45">
                                    Add products from the menu grid.
                                </div>
                            )}
                        </div>

                        {errors.items && (
                            <p className="mt-2 text-xs text-red-600">
                                {errors.items}
                            </p>
                        )}

                        <div className="mt-6 space-y-3 text-sm">
                            <div className="flex justify-between text-[#040404]/55">
                                <span>Subtotal</span>
                                <strong className="text-[#040404]">
                                    {money(subtotal)}
                                </strong>
                            </div>
                            <div className="flex justify-between text-[#040404]/45">
                                <span>Tax</span>
                                <span>{money(0)}</span>
                            </div>
                            <div className="flex justify-between text-[#040404]/45">
                                <span>Discount</span>
                                <span>{money(0)}</span>
                            </div>
                            <div className="border-t border-dashed border-[#040404]/10 pt-5">
                                <div className="flex justify-between text-lg">
                                    <span className="font-semibold">Total</span>
                                    <strong>{money(subtotal)}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3">
                            <div>
                                <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[#040404]/55">
                                    <ReceiptText className="size-3.5" />
                                    Payment
                                </span>
                                <div className="flex h-10 items-center justify-between border border-[#040404]/10 px-3 text-sm">
                                    <span className="flex items-center gap-2 font-medium">
                                        <Banknote className="size-4 text-[#2ec66d]" />
                                        Cash only
                                    </span>
                                    <Badge className="border-0 bg-[#2ec66d] text-white hover:bg-[#2ec66d]">
                                        Cash
                                    </Badge>
                                </div>
                                {errors.payment_method && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.payment_method}
                                    </p>
                                )}
                            </div>

                            <label>
                                <span className="mb-1 flex items-center gap-1.5 text-xs font-medium text-[#040404]/55">
                                    <Banknote className="size-3.5" />
                                    Amount paid
                                </span>
                                <Input
                                    value={data.amount_paid}
                                    onChange={(event) =>
                                        setData('amount_paid', event.target.value)
                                    }
                                    className="h-10 border-[#040404]/10 text-sm focus-visible:border-[#faa340] focus-visible:ring-[#faa340]/20"
                                    min="0"
                                    step="0.01"
                                    type="number"
                                    placeholder={money(subtotal)}
                                />
                                {errors.amount_paid && (
                                    <p className="mt-1 text-xs text-red-600">
                                        {errors.amount_paid}
                                    </p>
                                )}
                            </label>
                        </div>

                        <div className="mt-3 flex justify-between text-sm text-[#040404]/50">
                            <span>Change</span>
                            <span>
                                {money(Math.max(0, amountPaid - subtotal))}
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={
                                processing ||
                                cart.length === 0 ||
                                hasUnavailableLines
                            }
                            className="mt-8 inline-flex h-14 w-full items-center justify-center gap-2 rounded-none bg-[#2ec66d] px-4 text-base font-semibold text-white transition hover:bg-[#27b765] disabled:cursor-not-allowed disabled:opacity-45"
                        >
                            <PackageCheck className="size-5" />
                            {processing
                                ? 'Completing order...'
                                : `Pay ${money(subtotal)}`}
                        </button>

                        <div className="mt-5 flex items-center gap-2 text-xs text-[#040404]/45">
                            <Clock3 className="size-3.5" />
                            Prices and stock update every 5 seconds.
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}

PosIndex.layout = (page: ReactNode) => (
    <AppLayout breadcrumbs={breadcrumbs}>{page}</AppLayout>
);
