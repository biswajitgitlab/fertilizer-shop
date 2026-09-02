<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Invoice {{ $order->order_number }}</title>
    <style>
        body { font-family: sans-serif; font-size: 14px; }
        .header { text-align: center; margin-bottom: 30px; }
        .details { margin-bottom: 20px; }
        .details th, .details td { text-align: left; padding: 5px; }
        .items { width: 100%; border-collapse: collapse; }
        .items th, .items td { border: 1px solid #ddd; padding: 8px; }
        .items th { background-color: #f4f4f4; }
        .totals { margin-top: 20px; width: 100%; text-align: right; }
        .totals td { padding: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Invoice</h1>
        <p>Order Number: {{ $order->order_number }}</p>
        <p>Date: {{ $order->created_at->format('d M Y') }}</p>
    </div>

    <table class="details">
        <tr>
            <th>Customer:</th>
            <td>{{ $order->user->name }}</td>
            <th>Status:</th>
            <td>{{ $order->status }}</td>
        </tr>
    </table>

    <table class="items">
        <thead>
            <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            @foreach($order->items as $item)
            <tr>
                <td>{{ $item->product->name }}</td>
                <td>{{ $item->qty }}</td>
                <td>₹{{ number_format($item->unit_price, 2) }}</td>
                <td>₹{{ number_format($item->total, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <table class="totals">
        <tr>
            <td><strong>Subtotal:</strong></td>
            <td>₹{{ number_format($order->subtotal, 2) }}</td>
        </tr>
        <tr>
            <td><strong>Discount:</strong></td>
            <td>-₹{{ number_format($order->discount, 2) }}</td>
        </tr>
        <tr>
            <td><strong>Tax (18%):</strong></td>
            <td>₹{{ number_format($order->tax, 2) }}</td>
        </tr>
        <tr>
            <td><strong>Shipping:</strong></td>
            <td>₹{{ number_format($order->shipping_cost, 2) }}</td>
        </tr>
        <tr>
            <td><strong>Total:</strong></td>
            <td><strong>₹{{ number_format($order->total, 2) }}</strong></td>
        </tr>
    </table>
</body>
</html>
