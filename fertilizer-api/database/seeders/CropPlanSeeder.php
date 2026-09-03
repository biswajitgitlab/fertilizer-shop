<?php

namespace Database\Seeders;

use App\Models\CropPlan;
use App\Models\FertilizerSchedule;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;

class CropPlanSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        $products = Product::all();

        if ($users->isEmpty()) {
            return;
        }

        $npkProduct = $products->firstWhere('slug', 'iffco-npk-19-19-19-water-soluble');
        $ureaProduct = $products->firstWhere('slug', 'iffco-neem-coated-urea-46n');
        $zincProduct = $products->firstWhere('slug', 'aries-chelated-zinc-edta-12-micronutrient');
        $saafProduct = $products->firstWhere('slug', 'pi-saaf-fungicide-carbendazim-mancozeb');

        $plans = [
            [
                'user_index' => 0, // Ramesh Kumar
                'crop_name' => 'Basmati Rice (Pusa 1121)',
                'field_area' => 12.50,
                'sowing_date' => now()->subDays(45)->format('Y-m-d'),
                'expected_harvest' => now()->addDays(90)->format('Y-m-d'),
                'growth_stage' => 'Active Tillering Phase',
                'scheduled_tasks_json' => [
                    ['phase' => 'Basal Application', 'completed' => true, 'task' => 'DAP + Zinc EDTA basal mixing'],
                    ['phase' => 'Tillering', 'completed' => true, 'task' => '1st split Neem Coated Urea top dressing'],
                    ['phase' => 'Panicle Initiation', 'completed' => false, 'task' => 'NPK 19:19:19 foliar spray + Saaf preventive'],
                    ['phase' => 'Grain Filling', 'completed' => false, 'task' => 'Potash MOP final application'],
                ],
                'reminders_enabled' => true,
                'schedules' => [
                    [
                        'product_id' => $ureaProduct?->id,
                        'application_date' => now()->subDays(15)->format('Y-m-d'),
                        'qty' => 45.00,
                        'application_method' => 'Broadcast Top Dressing',
                        'status' => 'COMPLETED',
                        'notes' => 'Applied after 1st weeding and field irrigation.',
                    ],
                    [
                        'product_id' => $npkProduct?->id,
                        'application_date' => now()->addDays(10)->format('Y-m-d'),
                        'qty' => 5.00,
                        'application_method' => 'Foliar Spray 5g/L',
                        'status' => 'PENDING',
                        'notes' => 'Foliar spray early morning before panicle initiation.',
                    ],
                    [
                        'product_id' => $zincProduct?->id,
                        'application_date' => now()->addDays(25)->format('Y-m-d'),
                        'qty' => 1.00,
                        'application_method' => 'Micro-Drenching',
                        'status' => 'PENDING',
                        'notes' => 'Preventive Khaira disease foliar spray.',
                    ],
                ]
            ],
            [
                'user_index' => 1, // Biswajit Sarkar
                'crop_name' => 'High Yield Wheat (HD 3086)',
                'field_area' => 18.00,
                'sowing_date' => now()->subDays(60)->format('Y-m-d'),
                'expected_harvest' => now()->addDays(75)->format('Y-m-d'),
                'growth_stage' => 'Jointing & Booting Stage',
                'scheduled_tasks_json' => [
                    ['phase' => 'Sowing', 'completed' => true, 'task' => 'Certified seed treatment with Carboxin + Thiram'],
                    ['phase' => 'CRI Stage (21 Days)', 'completed' => true, 'task' => 'Crown root irrigation & Nitrogen split dose'],
                    ['phase' => 'Booting', 'completed' => false, 'task' => 'Yellow rust monitoring & Saaf spray'],
                ],
                'reminders_enabled' => true,
                'schedules' => [
                    [
                        'product_id' => $saafProduct?->id,
                        'application_date' => now()->addDays(5)->format('Y-m-d'),
                        'qty' => 2.00,
                        'application_method' => 'Foliar Spray',
                        'status' => 'PENDING',
                        'notes' => 'Yellow Rust preventive spray due to humid weather forecast.',
                    ]
                ]
            ]
        ];

        foreach ($plans as $planData) {
            $user = $users[$planData['user_index'] % count($users)];
            $schedules = $planData['schedules'];
            unset($planData['user_index'], $planData['schedules']);

            $planData['user_id'] = $user->id;

            $cropPlan = CropPlan::create($planData);

            foreach ($schedules as $sched) {
                $sched['crop_plan_id'] = $cropPlan->id;
                FertilizerSchedule::create($sched);
            }
        }
    }
}
