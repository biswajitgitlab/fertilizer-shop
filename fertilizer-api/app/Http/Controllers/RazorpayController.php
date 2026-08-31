<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Contracts\PaymentServiceInterface;
use InvalidArgumentException;
use RuntimeException;

class RazorpayController extends Controller
{
    public function __construct(
        protected PaymentServiceInterface $paymentService
    ) {}

    /**
     * Get Payment Circuit Breaker Status
     * GET /api/payment-gateway/status
     */
    public function getCircuitStatus()
    {
        return response()->json($this->paymentService->getCircuitStatus());
    }

    /**
     * Reset Circuit Breaker (Admin)
     * POST /api/admin/payment-gateway/reset-circuit
     */
    public function resetCircuit()
    {
        $result = $this->paymentService->resetCircuit();
        return response()->json($result);
    }

    /**
     * Create Razorpay Order
     * POST /api/create-order
     */
    public function createOrder(Request $request)
    {
        try {
            $result = $this->paymentService->createOrder($request->all());
            return response()->json($result, 200);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], $e->getCode() ?: 400);
        } catch (RuntimeException $e) {
            return response()->json([
                'status' => 'error',
                'circuit_open' => true,
                'message' => $e->getMessage(),
                'retry_after' => $this->paymentService->getCircuitStatus()['retry_after_seconds'] ?? 60
            ], $e->getCode() ?: 503);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Razorpay API Error: ' . $e->getMessage(),
                'circuit' => $this->paymentService->getCircuitStatus()
            ], 500);
        }
    }

    /**
     * Verify Razorpay Payment Signature
     * POST /api/verify-payment
     */
    public function verifyPayment(Request $request)
    {
        try {
            $result = $this->paymentService->verifyPayment($request->all());
            return response()->json($result, 200);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], $e->getCode() ?: 400);
        } catch (\Throwable $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment Verification Error: ' . $e->getMessage(),
                'circuit' => $this->paymentService->getCircuitStatus()
            ], 500);
        }
    }
}
