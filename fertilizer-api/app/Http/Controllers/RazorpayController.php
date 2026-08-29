<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Razorpay\Api\Api;
use App\Models\Order;
use App\Models\Payment;
use Illuminate\Support\Str;

class RazorpayController extends Controller
{
    /**
     * Create Razorpay Order
     * POST /api/create-order
     */
    public function createOrder(Request $request)
    {
        $keyId = env('RAZORPAY_KEY_ID');
        $keySecret = env('RAZORPAY_KEY_SECRET');

        if (!$keyId || !$keySecret) {
            return response()->json([
                'status' => 'error',
                'message' => 'Razorpay API credentials not configured'
            ], 401);
        }

        $amountInput = $request->input('amount');
        if ($amountInput === null || !is_numeric($amountInput)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Valid amount parameter is required'
            ], 400);
        }

        $amountInPaise = (int) $amountInput;

        if ($amountInPaise < 100) {
            return response()->json([
                'status' => 'error',
                'message' => 'Amount must be at least 100 paise (₹1)'
            ], 400);
        }

        $currency = $request->input('currency', 'INR');
        $receipt = $request->input('receipt', 'rcpt_' . Str::random(10));

        try {
            $api = new Api($keyId, $keySecret);
            $razorpayOrder = $api->order->create([
                'receipt' => (string) $receipt,
                'amount' => $amountInPaise,
                'currency' => $currency,
                'notes' => $request->input('notes', [])
            ]);

            return response()->json([
                'status' => 'success',
                'order_id' => $razorpayOrder['id'],
                'amount' => $razorpayOrder['amount'],
                'currency' => $razorpayOrder['currency'],
                'receipt' => $razorpayOrder['receipt'],
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Razorpay API Error: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify Razorpay Payment Signature
     * POST /api/verify-payment
     */
    public function verifyPayment(Request $request)
    {
        $keySecret = env('RAZORPAY_KEY_SECRET');

        if (!$keySecret) {
            return response()->json([
                'status' => 'error',
                'message' => 'Razorpay API secret not configured'
            ], 401);
        }

        $razorpayOrderId = $request->input('razorpay_order_id');
        $razorpayPaymentId = $request->input('razorpay_payment_id');
        $razorpaySignature = $request->input('razorpay_signature');

        if (!$razorpayOrderId || !$razorpayPaymentId || !$razorpaySignature) {
            return response()->json([
                'status' => 'error',
                'message' => 'Missing required payment verification parameters: razorpay_order_id, razorpay_payment_id, and razorpay_signature are required'
            ], 400);
        }

        $generatedSignature = hash_hmac('sha256', $razorpayOrderId . '|' . $razorpayPaymentId, $keySecret);

        if (!hash_equals($generatedSignature, $razorpaySignature)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid payment signature: Signature mismatch'
            ], 400);
        }

        $dbOrderId = $request->input('order_id') ?? $request->input('db_order_id');
        $order = null;

        if ($dbOrderId) {
            $order = Order::find($dbOrderId) ?? Order::where('order_number', $dbOrderId)->first();
            if ($order) {
                $order->update([
                    'payment_status' => 'PAID',
                    'status' => 'CONFIRMED',
                    'tracking_number' => $order->tracking_number ?? ('TRK-' . strtoupper(Str::random(9)))
                ]);

                Payment::updateOrCreate(
                    ['order_id' => $order->id],
                    [
                        'gateway' => 'RAZORPAY',
                        'transaction_id' => $razorpayPaymentId,
                        'amount' => $order->total,
                        'status' => 'SUCCESS',
                        'response_json' => array_merge($request->all(), [
                            'verified_at' => now()->toIso8601String(),
                            'razorpay_order_id' => $razorpayOrderId,
                        ])
                    ]
                );
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Payment verified successfully',
            'razorpay_payment_id' => $razorpayPaymentId,
            'razorpay_order_id' => $razorpayOrderId,
            'order' => $order ? $order->load(['items.product', 'payment']) : null,
        ], 200);
    }
}
