<?php

namespace App\Enums;

enum PurchaseOrderStatus: string
{
    case Pending = 'pending';
    case Draft = 'draft';
    case Ordered = 'ordered';
    case PartiallyReceived = 'partially_received';
    case Received = 'received';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Draft => 'Draft',
            self::Ordered => 'Ordered',
            self::PartiallyReceived => 'Partially Received',
            self::Received => 'Received',
            self::Cancelled => 'Cancelled',
        };
    }
}
