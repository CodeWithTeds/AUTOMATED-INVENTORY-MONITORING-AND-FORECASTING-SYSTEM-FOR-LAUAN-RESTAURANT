<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Receipt {{ $purchaseOrder->order_number }}</title>
    <style>
        body {
            font-family: 'Courier New', Courier, monospace;
            font-size: 12px;
            margin: 0;
            padding: 20px;
            color: #000;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .font-bold { font-weight: bold; }
        .mb-2 { margin-bottom: 10px; }
        .mt-2 { margin-top: 10px; }
        .border-dashed { border-bottom: 1px dashed #000; }
        .border-t-dashed { border-top: 1px dashed #000; }
        .flex { display: flex; justify-content: space-between; }
        .w-full { width: 100%; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 4px 0; }
        .title { font-size: 16px; font-weight: bold; letter-spacing: 2px; }
        .subtitle { font-size: 10px; margin-top: 4px; }
        .summary-table { margin-top: 10px; width: 100%; }
        .summary-table td { padding: 2px 0; }
        .total-row { font-size: 14px; font-weight: bold; }
    </style>
</head>
<body>
    <div class="text-center mb-2">
        <div class="title">CASH RECEIPT</div>
        <div class="subtitle">Lauan POS</div>
        <div class="subtitle mb-2">Cash only counter</div>
    </div>

    <div class="border-dashed pb-2 mb-2">
        <table class="w-full">
            <tr>
                <td>Date:</td>
                <td class="text-right">{{ $purchaseOrder->paid_at ?? ($purchaseOrder->received_at?->format('Y-m-d H:i') ?? 'Just now') }}</td>
            </tr>
            <tr>
                <td>No:</td>
                <td class="text-right">{{ $purchaseOrder->order_number }}</td>
            </tr>
            <tr>
                <td>Name:</td>
                <td class="text-right">{{ $purchaseOrder->customer_name ?? 'Walk-in' }}</td>
            </tr>
            <tr>
                <td>Supplier:</td>
                <td class="text-right">{{ $purchaseOrder->supplier_name ?? 'N/A' }}</td>
            </tr>
        </table>
    </div>

    <div class="mb-2">
        <table class="w-full">
            @php
                $posOrder = \App\Models\PosOrder::with('items')->where('order_number', $purchaseOrder->order_number)->first();
                $items = $posOrder ? $posOrder->items : [];
            @endphp
            @if(count($items) > 0)
                @foreach($items as $item)
                <tr>
                    <td style="width: 15%">{{ number_format($item->quantity, 0) }}x</td>
                    <td style="width: 55%">{{ $item->item_name ?? 'Item' }}</td>
                    <td style="width: 30%" class="text-right">PHP {{ number_format($item->line_total, 2) }}</td>
                </tr>
                @endforeach
            @else
                <tr>
                    <td style="width: 70%">Items (count)</td>
                    <td style="width: 30%" class="text-right">{{ $purchaseOrder->items_count }}</td>
                </tr>
            @endif
        </table>
    </div>

    <div class="border-t-dashed pt-2 mt-2">
        <table class="summary-table">
            <tr>
                <td>Sub-total</td>
                <td class="text-right">PHP {{ number_format($purchaseOrder->subtotal_amount ?? $purchaseOrder->total_amount, 2) }}</td>
            </tr>
            <tr>
                <td>Cash</td>
                <td class="text-right">PHP {{ number_format($purchaseOrder->amount_paid ?? $purchaseOrder->total_amount, 2) }}</td>
            </tr>
            <tr>
                <td>Change</td>
                <td class="text-right">PHP {{ number_format($purchaseOrder->change_amount ?? 0, 2) }}</td>
            </tr>
            <tr class="total-row">
                <td class="pt-2">Total</td>
                <td class="text-right pt-2">PHP {{ number_format($purchaseOrder->total_amount, 2) }}</td>
            </tr>
        </table>
    </div>

    <div class="text-center mt-2 font-bold title" style="margin-top: 20px;">
        THANK YOU
    </div>
</body>
</html>
