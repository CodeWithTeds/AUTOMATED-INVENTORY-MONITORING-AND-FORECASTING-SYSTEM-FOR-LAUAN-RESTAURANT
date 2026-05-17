<?php

namespace App\Repositories\Supplier;

use App\Enums\SupplierStatus;
use App\Models\Supplier;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class SupplierRepository implements SupplierRepositoryInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateForSuppliers(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->queryForFilters($filters)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function find(int $id): Supplier
    {
        return Supplier::query()->findOrFail($id);
    }

    public function nextCode(): string
    {
        $latestNumber = Supplier::query()
            ->where('code', 'like', 'SUP-%')
            ->pluck('code')
            ->reduce(function (int $highest, string $code): int {
                if (preg_match('/^SUP-(\d+)$/', $code, $matches) !== 1) {
                    return $highest;
                }

                return max($highest, (int) $matches[1]);
            }, 0);

        return sprintf('SUP-%03d', $latestNumber + 1);
    }

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public function options(): array
    {
        return Supplier::query()
            ->orderBy('name')
            ->get(['code', 'name'])
            ->map(fn (Supplier $supplier): array => [
                'value' => $supplier->name,
                'label' => "{$supplier->name} ({$supplier->code})",
            ])
            ->all();
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): Supplier
    {
        return Supplier::query()->create($attributes);
    }

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(Supplier $supplier, array $attributes): bool
    {
        return $supplier->update($attributes);
    }

    public function delete(Supplier $supplier): bool
    {
        return $supplier->delete();
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Supplier>
     */
    public function reportRows(array $filters): Collection
    {
        return $this->queryForFilters($filters)
            ->limit(500)
            ->get();
    }

    /**
     * @return array<string, int|float>
     */
    public function summary(): array
    {
        return [
            'total' => Supplier::query()->count(),
            'preferred' => Supplier::query()->where('status', SupplierStatus::Preferred->value)->count(),
            'watchlist' => Supplier::query()->where('status', SupplierStatus::Watchlist->value)->count(),
            'inactive' => Supplier::query()->where('status', SupplierStatus::Inactive->value)->count(),
            'average_lead_time' => round((float) Supplier::query()->avg('lead_time_days'), 1),
        ];
    }

    /**
     * @return array<int, string>
     */
    public function cities(): array
    {
        return Supplier::query()
            ->whereNotNull('city')
            ->where('city', '!=', '')
            ->distinct()
            ->orderBy('city')
            ->pluck('city')
            ->all();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function queryForFilters(array $filters): Builder
    {
        $sortable = ['code', 'name', 'category', 'city', 'lead_time_days', 'rating', 'status'];
        $sort = in_array($filters['sort'] ?? '', $sortable, true) ? $filters['sort'] : 'name';
        $direction = ($filters['direction'] ?? '') === 'desc' ? 'desc' : 'asc';

        return Supplier::query()
            ->when($filters['search'] ?? null, function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query
                        ->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('contact_person', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('city', 'like', "%{$search}%");
                });
            })
            ->when($filters['category'] ?? null, fn (Builder $query, string $category) => $query->where('category', $category))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['city'] ?? null, fn (Builder $query, string $city) => $query->where('city', $city))
            ->when($filters['rating'] ?? null, fn (Builder $query, string $rating) => $query->where('rating', '>=', (int) $rating))
            ->orderBy($sort, $direction)
            ->orderBy('id');
    }
}
