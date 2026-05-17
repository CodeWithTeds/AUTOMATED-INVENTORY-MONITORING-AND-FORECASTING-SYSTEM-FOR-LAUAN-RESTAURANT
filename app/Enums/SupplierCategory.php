<?php

namespace App\Enums;

enum SupplierCategory: string
{
    case Produce = 'produce';
    case MeatSeafood = 'meat_seafood';
    case DryGoods = 'dry_goods';
    case Beverage = 'beverage';
    case Packaging = 'packaging';
    case Equipment = 'equipment';
    case Services = 'services';

    public function label(): string
    {
        return match ($this) {
            self::Produce => 'Produce',
            self::MeatSeafood => 'Meat & Seafood',
            self::DryGoods => 'Dry Goods',
            self::Beverage => 'Beverage',
            self::Packaging => 'Packaging',
            self::Equipment => 'Equipment',
            self::Services => 'Services',
        };
    }
}
