<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\ReportExportService;

class DispatchRegulatoryReportCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'report:dispatch-regulatory';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Compile and dispatch weekly PM-PRANAM government subsidy and chemical ledger reports.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('Starting automated regulatory compliance dispatch...');

        $success = ReportExportService::dispatchWeeklyComplianceReport();

        if ($success) {
            $this->info('Weekly regulatory compliance report successfully compiled and dispatched!');
            return Command::SUCCESS;
        }

        $this->error('Failed to compile regulatory report.');
        return Command::FAILURE;
    }
}
