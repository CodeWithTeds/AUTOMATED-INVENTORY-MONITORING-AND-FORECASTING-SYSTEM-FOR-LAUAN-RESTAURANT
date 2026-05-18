<?php

namespace App\Repositories\PurchaseOrder;

use App\Enums\PurchaseOrderStatus;
use App\Models\PurchaseOrder;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class PurchaseOrderRepository implements PurchaseOrderRepositoryInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters, int $perPage = 12): LengthAwarePaginator
    {
        return $this->queryForFilters($filters)
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * @return Collection<int, PurchaseOrder>
     */
    public function recentForPos(int $limit = 3): Collection
    {
        return PurchaseOrder::query()
            ->whereIn('status', [
                PurchaseOrderStatus::Draft->value,
                PurchaseOrderStatus::Ordered->value,
                PurchaseOrderStatus::PartiallyReceived->value,
            ])
            ->orderByRaw('expected_at is null')
            ->orderBy('expected_at')
            ->latest()
            ->limit($limit)
            ->get();
    }

    /**
     * @return array<string, float|int>
     */
    public function summary(): array
    {
        return [
            'total' => PurchaseOrder::query()->count(),
            'open' => PurchaseOrder::query()
                ->whereIn('status', [
                    PurchaseOrderStatus::Draft->value,
                    PurchaseOrderStatus::Ordered->value,
                    PurchaseOrderStatus::PartiallyReceived->value,
                ])
                ->count(),
            'received' => PurchaseOrder::query()->where('status', PurchaseOrderStatus::Received->value)->count(),
            'open_value' => (float) PurchaseOrder::query()
                ->whereIn('status', [
                    PurchaseOrderStatus::Draft->value,
                    PurchaseOrderStatus::Ordered->value,
                    PurchaseOrderStatus::PartiallyReceived->value,
                ])
                ->sum('total_amount'),
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function queryForFilters(array $filters): Builder
    {
        $sortable = ['order_number', 'supplier_name', 'status', 'items_count', 'total_amount', 'expected_at'];
        $sort = in_array($filters['sort'] ?? '', $sortable, true) ? $filters['sort'] : 'expected_at';
        $direction = ($filters['direction'] ?? '') === 'asc' ? 'asc' : 'desc';

        return PurchaseOrder::query()
            ->when($filters['search'] ?? null, function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->where('order_number', 'like', "%{$search}%")
                        ->orWhere('supplier_name', 'like', "%{$search}%");
                });
            })
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->orderByRaw('expected_at is null')
            ->orderBy($sort, $direction)
            ->orderBy('id', 'desc');
    }
}
