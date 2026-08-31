<?php

namespace App\Contracts;

interface PaymentServiceInterface
{
    /**
     * Create a payment gateway order (e.g. Razorpay Order)
     */
    public function createOrder(array $data): array;

    /**
     * Verify payment signature and record order payment status
     */
    public function verifyPayment(array $data): array;

    /**
     * Get circuit breaker status for payment gateway
     */
    public function getCircuitStatus(): array;

    /**
     * Reset payment gateway circuit breaker
     */
    public function resetCircuit(): array;
}
