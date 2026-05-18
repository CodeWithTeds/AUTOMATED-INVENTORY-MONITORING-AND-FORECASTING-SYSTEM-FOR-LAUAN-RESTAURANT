<?php

namespace App\Enums;

enum PosOrderStatus: string
{
    case Paid = 'paid';
    case Voided = 'voided';

    public function label(): string
    {
        return match ($this) {
            self::Paid => 'Paid',
            self::Voided => 'Voided',
        };
    }
}
