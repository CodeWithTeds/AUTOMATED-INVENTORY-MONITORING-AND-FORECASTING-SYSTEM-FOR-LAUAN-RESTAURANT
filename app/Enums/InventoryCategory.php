<?php

namespace App\Enums;

enum InventoryCategory: string
{
    case Produce = 'produce';
    case Meat = 'meat';
    case Seafood = 'seafood';
    case Dairy = 'dairy';
    case DryGoods = 'dry_goods';
    case Beverage = 'beverage';
    case Condiment = 'condiment';
    case Packaging = 'packaging';
    case Cleaning = 'cleaning';

    public function label(): string
    {
        return match ($this) {
            self::Produce => 'Produce',
            self::Meat => 'Meat',
            self::Seafood => 'Seafood',
            self::Dairy => 'Dairy',
            self::DryGoods => 'Dry Goods',
            self::Beverage => 'Beverage',
            self::Condiment => 'Condiment',
            self::Packaging => 'Packaging',
            self::Cleaning => 'Cleaning',
        };
    }
}
