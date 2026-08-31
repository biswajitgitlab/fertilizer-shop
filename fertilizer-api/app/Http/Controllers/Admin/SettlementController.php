<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\DriverSettlement;
use App\Models\Order;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SettlementController extends Controller
{
    public function index(Request $request)
    {
        $settlements = DriverSettlement::with(['order.user', 'driver', 'reconciler'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($settlements);
    }

    public function settle(Request $request, $id)
    {
        $settlement = DriverSettlement::findOrFail($id);
        $settlement->status = 'SETTLED_TO_BANK';
        $settlement->reconciled_by = auth()->id() ?? 1;
        $settlement->settled_at = Carbon::now();
        $settlement->save();

        if ($settlement->order) {
            $settlement->order->payment_status = 'PAID';
            $settlement->order->save();
        }

        return response()->json([
            'message' => 'COD Field collection settled successfully',
            'settlement' => $settlement->load(['order', 'driver', 'reconciler']),
        ]);
    }
}
