<?php

namespace App\Repositories\Supplier;

use App\Models\Supplier;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

interface SupplierRepositoryInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginateForSuppliers(array $filters, int $perPage = 15): LengthAwarePaginator;

    public function find(int $id): Supplier;

    public function nextCode(): string;

    /**
     * @return array<int, array{value: string, label: string}>
     */
    public function options(): array;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): Supplier;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(Supplier $supplier, array $attributes): bool;

    public function delete(Supplier $supplier): bool;

    /**
     * @param  array<string, mixed>  $filters
     * @return Collection<int, Supplier>
     */
    public function reportRows(array $filters): Collection;

    /**
     * @return array<string, int|float>
     */
    public function summary(): array;

    /**
     * @return array<int, string>
     */
    public function cities(): array;
}
