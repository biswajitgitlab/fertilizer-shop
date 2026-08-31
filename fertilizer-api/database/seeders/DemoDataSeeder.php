<?php

namespace Database\Seeders;

use App\Models\AuditLog;
use App\Models\CropDiagnosis;
use App\Models\DriverSettlement;
use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Seeder;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::pluck('id')->toArray();
        if (empty($users)) {
            return;
        }

        $adminUser = User::whereHas('roles', function ($q) {
            $q->whereIn('name', ['Super Admin', 'Admin', 'Store Manager']);
        })->first() ?? User::first();

        $adminUserId = $adminUser ? $adminUser->id : $users[0];

        // 1. Seed Driver Settlements for all COD orders
        $codOrders = Order::whereIn('payment_method', ['COD', 'CASH_ON_DELIVERY'])->get();
        foreach ($codOrders as $index => $order) {
            DriverSettlement::firstOrCreate(
                ['order_id' => $order->id],
                [
                    'driver_id' => $adminUserId,
                    'cash_collected' => $order->total,
                    'status' => $index % 2 === 0 ? 'SETTLED_TO_BANK' : 'DRIVER_COLLECTION_PENDING',
                ]
            );
        }

        // 2. Seed Crop Diagnoses
        $diagnosesData = [
            [
                'crop_name' => 'Paddy (Rice)',
                'location' => 'Karnal, Haryana',
                'growth_stage' => 'Vegetative / Tillering',
                'symptoms_json' => ['Yellowing of lower leaf tips', 'Brown lesions with yellow halos', 'Stunted plant height'],
                'images_json' => ['https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&q=80&w=600'],
                'ai_result' => 'Bacterial Leaf Blight (Xanthomonas oryzae)',
                'confidence_score' => 94.50,
                'recommended_products_json' => ['PI Saaf Fungicide (Carbendazim + Mancozeb)', 'Aries Chelated Zinc EDTA 12%'],
                'severity' => 'High',
                'status' => 'COMPLETED',
                'admin_reviewed' => true,
                'admin_notes' => 'Verified by Senior Pathologist Dr. Sharma. Recommended 2g/L foliar spray.',
            ],
            [
                'crop_name' => 'Wheat',
                'location' => 'Ludhiana, Punjab',
                'growth_stage' => 'Booting / Earhead',
                'symptoms_json' => ['Bright yellow pustules on leaf surface', 'Powdery orange dust on hands when touched'],
                'images_json' => ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600'],
                'ai_result' => 'Yellow Rust (Puccinia striiformis)',
                'confidence_score' => 98.20,
                'recommended_products_json' => ['PI Saaf Fungicide', 'Bio-Vita Seaweed Kelp Booster'],
                'severity' => 'High',
                'status' => 'COMPLETED',
                'admin_reviewed' => true,
                'admin_notes' => 'Confirmed Yellow Rust outbreak in North Zone. High severity spray alert issued.',
            ],
            [
                'crop_name' => 'Cotton',
                'location' => 'Bhatinda, Punjab',
                'growth_stage' => 'Flowering & Boll Formation',
                'symptoms_json' => ['Curled upper leaves', 'Sticky honeydew secretion', 'Sooty mold growth'],
                'images_json' => ['https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&q=80&w=600'],
                'ai_result' => 'Whitefly Infestation & Leaf Curl Virus',
                'confidence_score' => 89.10,
                'recommended_products_json' => ['Bayer Confidor 200 SL (Imidacloprid)', 'Bio-Neem Oil 10000 PPM'],
                'severity' => 'Medium',
                'status' => 'PENDING',
                'admin_reviewed' => false,
                'admin_notes' => null,
            ],
            [
                'crop_name' => 'Tomato',
                'location' => 'Nashik, Maharashtra',
                'growth_stage' => 'Fruiting Stage',
                'symptoms_json' => ['Concentric dark ring spots on lower leaves', 'Premature leaf drop', 'Fruit stem rot'],
                'images_json' => ['https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=600'],
                'ai_result' => 'Early Blight (Alternaria solani)',
                'confidence_score' => 92.40,
                'recommended_products_json' => ['PI Saaf Fungicide', 'IFFCO NPK 19:19:19'],
                'severity' => 'Medium',
                'status' => 'COMPLETED',
                'admin_reviewed' => true,
                'admin_notes' => 'Apply Copper Oxychloride 3g/L or Saaf 2g/L at 7-day interval.',
            ],
            [
                'crop_name' => 'Sugarcane',
                'location' => 'Meerut, Uttar Pradesh',
                'growth_stage' => 'Grand Growth Phase',
                'symptoms_json' => ['Red discoloration inside stem vascular bundles', 'Sour alcoholic smell when split open'],
                'images_json' => ['https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&q=80&w=600'],
                'ai_result' => 'Sugarcane Red Rot (Colletotrichum falcatum)',
                'confidence_score' => 96.80,
                'recommended_products_json' => ['Tatva Pure Vermicompost Bio-Organic Granules', 'Humic Acid 98% Bio-Organic Granules'],
                'severity' => 'High',
                'status' => 'PENDING',
                'admin_reviewed' => false,
                'admin_notes' => null,
            ],
        ];

        foreach ($diagnosesData as $idx => $diag) {
            CropDiagnosis::create([
                'user_id' => $users[$idx % count($users)],
                'crop_name' => $diag['crop_name'],
                'location' => $diag['location'],
                'growth_stage' => $diag['growth_stage'],
                'symptoms_json' => $diag['symptoms_json'],
                'images_json' => $diag['images_json'],
                'ai_result' => $diag['ai_result'],
                'confidence_score' => $diag['confidence_score'],
                'recommended_products_json' => $diag['recommended_products_json'],
                'severity' => $diag['severity'],
                'status' => $diag['status'],
                'admin_reviewed' => $diag['admin_reviewed'],
                'admin_notes' => $diag['admin_notes'],
            ]);
        }

        // 3. Seed Audit Logs
        $logsData = [
            [
                'action' => 'ROLE_PERMISSIONS_UPDATED',
                'target' => 'Role: Store Manager',
                'details' => 'Granted inventory.manage and orders.fulfill capabilities to Vikram Singh.',
                'risk_level' => 'HIGH',
            ],
            [
                'action' => 'DRIVER_COD_RECONCILED',
                'target' => 'Settlement Ledger #ORD-1001',
                'details' => 'Reconciled ₹758.00 cash collected by Field Officer Vikram to ICICI Bank account.',
                'risk_level' => 'MEDIUM',
            ],
            [
                'action' => 'WAREHOUSE_ZONE_CAPACITY_MODIFIED',
                'target' => 'Zone: ZONE-A (Nitrogen Storage)',
                'details' => 'Updated capacity from 5,000 units to 8,000 units with temperature sensors enabled.',
                'risk_level' => 'MEDIUM',
            ],
            [
                'action' => 'BATCH_FEFO_DISPATCH_TRIGGERED',
                'target' => 'Batch: BATCH-UREA-2026-A',
                'details' => 'Automated FEFO inventory deduction applied for 50 bags of Neem Coated Urea.',
                'risk_level' => 'LOW',
            ],
            [
                'action' => 'SUBSIDY_KCC_VERIFIED',
                'target' => 'Farmer: Ramesh Patel',
                'details' => 'Biometric Aadhaar hash matched. PM-PRANAM Category A direct subsidy enabled.',
                'risk_level' => 'LOW',
            ],
            [
                'action' => 'PRODUCT_PRICE_OVERRIDE',
                'target' => 'Product: IFFCO NPK 19:19:19',
                'details' => 'Discount price updated to ₹320.00 (FCO subsidized standard rate).',
                'risk_level' => 'MEDIUM',
            ],
            [
                'action' => 'SECURITY_LOGIN_SUCCESS',
                'target' => 'SuperAdmin Portal',
                'details' => 'Super Admin logged in successfully from IP 192.168.1.45 via 2FA token.',
                'risk_level' => 'LOW',
            ],
        ];

        foreach ($logsData as $idx => $log) {
            AuditLog::create([
                'user_id' => $adminUserId,
                'action' => $log['action'],
                'target' => $log['target'],
                'details' => $log['details'],
                'ip_address' => '127.0.0.1',
                'risk_level' => $log['risk_level'],
            ]);
        }
    }
}
