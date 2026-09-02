<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Closure;

class PaymentCircuitBreaker
{
    private string $serviceKey;
    private int $failureThreshold;
    private int $cooldownSeconds;

    public function __construct(string $serviceKey = 'razorpay_gateway', int $failureThreshold = 3, int $cooldownSeconds = 60)
    {
        $this->serviceKey = $serviceKey;
        $this->failureThreshold = $failureThreshold;
        $this->cooldownSeconds = $cooldownSeconds;
    }

    private function stateKey(): string
    {
        return "circuit_breaker:{$this->serviceKey}:state";
    }

    private function failureCountKey(): string
    {
        return "circuit_breaker:{$this->serviceKey}:failures";
    }

    private function nextAttemptKey(): string
    {
        return "circuit_breaker:{$this->serviceKey}:next_attempt";
    }

    public function getState(): string
    {
        $state = Cache::get($this->stateKey(), 'CLOSED');

        if ($state === 'OPEN') {
            $nextAttempt = Cache::get($this->nextAttemptKey(), 0);
            if (time() >= $nextAttempt) {
                // Cooldown period expired, transition to HALF_OPEN to probe service health
                $this->setState('HALF_OPEN');
                return 'HALF_OPEN';
            }
        }

        return $state;
    }

    public function isAvailable(): bool
    {
        return $this->getState() !== 'OPEN';
    }

    public function execute(Closure $action)
    {
        $state = $this->getState();

        if ($state === 'OPEN') {
            $nextAttempt = Cache::get($this->nextAttemptKey(), 0);
            $retryAfter = max(1, $nextAttempt - time());
            
            Log::warning("Circuit breaker OPEN for {$this->serviceKey}. Fast-failing request.");
            throw new \RuntimeException("Payment gateway is temporarily undergoing high failure rates. Please use Cash on Delivery or retry in {$retryAfter} seconds.", 503);
        }

        try {
            $result = $action();
            $this->recordSuccess();
            return $result;
        } catch (\Throwable $e) {
            $this->recordFailure($e);
            throw $e;
        }
    }

    public function recordSuccess(): void
    {
        Cache::forget($this->failureCountKey());
        Cache::forget($this->nextAttemptKey());
        $this->setState('CLOSED');
    }

    public function recordFailure(?\Throwable $e = null): void
    {
        $failures = (int) Cache::get($this->failureCountKey(), 0) + 1;
        Cache::put($this->failureCountKey(), $failures, 3600);

        Log::warning("Circuit breaker recorded failure for {$this->serviceKey}. Count: {$failures}/{$this->failureThreshold}. Error: " . ($e ? $e->getMessage() : 'Unknown'));

        if ($failures >= $this->failureThreshold) {
            $this->tripCircuit();
        }
    }

    public function tripCircuit(): void
    {
        $nextAttempt = time() + $this->cooldownSeconds;
        $this->setState('OPEN');
        Cache::put($this->nextAttemptKey(), $nextAttempt, $this->cooldownSeconds + 10);
        Log::error("Circuit breaker TRIPPED OPEN for {$this->serviceKey}! Cooldown for {$this->cooldownSeconds}s.");
    }

    public function reset(): void
    {
        Cache::forget($this->stateKey());
        Cache::forget($this->failureCountKey());
        Cache::forget($this->nextAttemptKey());
    }

    private function setState(string $state): void
    {
        Cache::put($this->stateKey(), $state, 86400);
    }

    public function getStatusDetails(): array
    {
        $state = $this->getState();
        $failures = (int) Cache::get($this->failureCountKey(), 0);
        $nextAttempt = (int) Cache::get($this->nextAttemptKey(), 0);
        $retryAfter = max(0, $nextAttempt - time());

        return [
            'service' => $this->serviceKey,
            'state' => $state,
            'is_available' => $state !== 'OPEN',
            'failure_count' => $failures,
            'threshold' => $this->failureThreshold,
            'cooldown_seconds' => $this->cooldownSeconds,
            'retry_after_seconds' => $retryAfter,
        ];
    }
}
