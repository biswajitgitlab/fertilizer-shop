<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $orderId;
    public $status;
    public $order;

    public function __construct(Order $order)
    {
        $this->orderId = $order->id;
        $this->status = $order->status;
        $this->order = [
            'id' => (string)$order->id,
            'order_number' => $order->order_number,
            'status' => $order->status,
            'packer_name' => $order->packer ? $order->packer->name : null,
            'driver_name' => $order->driver ? $order->driver->name : null,
            'tracking_number' => $order->tracking_number,
            'updated_at' => optional($order->updated_at)->toISOString(),
        ];
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('orders.' . $this->orderId),
            new Channel('admin-orders'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'OrderStatusUpdated';
    }
}
