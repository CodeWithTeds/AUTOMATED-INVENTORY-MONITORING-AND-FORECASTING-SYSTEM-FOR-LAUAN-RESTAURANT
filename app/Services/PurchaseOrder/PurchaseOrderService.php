<?php

namespace App\Services\PurchaseOrder;

use App\Enums\PurchaseOrderStatus;
use App\Http\Resources\PurchaseOrderResource;
use App\Models\PurchaseOrder;
use App\Repositories\PurchaseOrder\PurchaseOrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PurchaseOrderService
{
    public function __construct(private readonly PurchaseOrderRepositoryInterface $purchaseOrders) {}

    /**
     * @param  array<string, mixed>  $filters
     * @return array<string, mixed>
     */
    public function indexData(array $filters): array
    {
        $normalizedFilters = array_filter($filters, fn ($value) => $value !== null && $value !== '');
        $paginator = $this->purchaseOrders->paginate($normalizedFilters);

        return [
            'purchaseOrders' => $this->paginatedPurchaseOrders($paginator),
            'filters' => $normalizedFilters,
            'summary' => $this->purchaseOrders->summary(),
            'statusOptions' => $this->enumOptions(PurchaseOrderStatus::cases()),
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function recentForPos(): array
    {
        return PurchaseOrderResource::collection($this->purchaseOrders->recentForPos())->resolve();
    }

    /**
     * @return array<string, float|int>
     */
    public function summary(): array
    {
        return $this->purchaseOrders->summary();
    }

    public function find(int $id): PurchaseOrder
    {
        return $this->purchaseOrders->find($id);
    }

    public function updateStatus(int $id, string $status): PurchaseOrder
    {
        $purchaseOrder = $this->purchaseOrders->find($id);

        $this->purchaseOrders->updateStatus($purchaseOrder, $status);

        return $purchaseOrder->refresh();
    }

    public function receiptText(PurchaseOrder $purchaseOrder): string
    {
        return implode(PHP_EOL, [
            'CASH RECEIPT',
            'Lauan POS',
            'Purchase order copy',
            str_repeat('-', 32),
            "PO Number: {$purchaseOrder->order_number}",
            "Supplier: {$purchaseOrder->supplier_name}",
            'Status: '.$purchaseOrder->status->label(),
            'Items: '.$purchaseOrder->items_count,
            'Total: PHP '.number_format((float) $purchaseOrder->total_amount, 2),
            'Ordered: '.($purchaseOrder->ordered_at?->format('Y-m-d') ?? 'Pending'),
            'Expected: '.($purchaseOrder->expected_at?->format('Y-m-d') ?? 'TBD'),
            'Received: '.($purchaseOrder->received_at?->format('Y-m-d') ?? 'Not received'),
            str_repeat('-', 32),
            'Notes:',
            $purchaseOrder->notes ?: 'No notes recorded.',
            '',
        ]);
    }

    /**
     * @param  array<int, object>  $cases
     * @return array<int, array{value: string, label: string}>
     */
    private function enumOptions(array $cases): array
    {
        return array_map(fn ($case) => [
            'value' => $case->value,
            'label' => $case->label(),
        ], $cases);
    }

    /**
     * @return array<string, mixed>
     */
    private function paginatedPurchaseOrders(LengthAwarePaginator $paginator): array
    {
        return [
            'data' => PurchaseOrderResource::collection($paginator->items())->resolve(),
            'links' => $this->paginationLinks($paginator),
            'meta' => [
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
            ],
        ];
    }

    /**
     * @return array<int, array{url: string|null, label: string, active: bool}>
     */
    private function paginationLinks(LengthAwarePaginator $paginator): array
    {
        $links = [
            [
                'url' => $paginator->previousPageUrl(),
                'label' => '&laquo; Previous',
                'active' => false,
            ],
        ];

        foreach ($paginator->getUrlRange(1, $paginator->lastPage()) as $page => $url) {
            $links[] = [
                'url' => $url,
                'label' => (string) $page,
                'active' => $page === $paginator->currentPage(),
            ];
        }

        $links[] = [
            'url' => $paginator->nextPageUrl(),
            'label' => 'Next &raquo;',
            'active' => false,
        ];

        return $links;
    }
}
