<?php

namespace App\Enums;

enum InventoryItemStatus: string
{
    case Active = 'active';
    case Watchlist = 'watchlist';
    case Inactive = 'inactive';

    public function label(): string
    {
        return match ($this) {
            self::Active => 'Active',
            self::Watchlist => 'Watchlist',
            self::Inactive => 'Inactive',
        };
    }
}
