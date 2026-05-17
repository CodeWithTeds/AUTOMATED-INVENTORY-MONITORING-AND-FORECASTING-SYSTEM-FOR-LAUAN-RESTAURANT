<?php

namespace App\Enums;

enum SupplierStatus: string
{
    case Preferred = 'preferred';
    case Active = 'active';
    case Watchlist = 'watchlist';
    case Inactive = 'inactive';

    public function label(): string
    {
        return match ($this) {
            self::Preferred => 'Preferred',
            self::Active => 'Active',
            self::Watchlist => 'Watchlist',
            self::Inactive => 'Inactive',
        };
    }
}
