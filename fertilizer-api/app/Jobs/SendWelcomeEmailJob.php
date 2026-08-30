<?php

namespace App\Jobs;

use App\Models\User;
use App\Mail\WelcomeUserMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class SendWelcomeEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     *
     * @var int
     */
    public int $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     *
     * @var array
     */
    public array $backoff = [10, 30, 60];

    /**
     * Create a new job instance.
     */
    public function __construct(public User $user)
    {
        $this->onQueue('notifications');
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Log::info("Processing SendWelcomeEmailJob for User #{$this->user->id} ({$this->user->email}) via Redis Queue.");

        try {
            Mail::to($this->user->email)->send(new WelcomeUserMail($this->user));
            Log::info("Welcome email sent successfully to {$this->user->email}");
        } catch (\Exception $e) {
            Log::error("Failed to send welcome email to {$this->user->email}: " . $e->getMessage());
            throw $e; // Trigger job retry
        }
    }
}
