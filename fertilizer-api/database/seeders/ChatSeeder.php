<?php

namespace Database\Seeders;

use App\Models\ChatMessage;
use App\Models\ChatSession;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ChatSeeder extends Seeder
{
    public function run(): void
    {
        $users = User::all();
        if ($users->isEmpty()) {
            return;
        }

        $chatsSample = [
            [
                'user_index' => 0, // Ramesh Kumar
                'channel' => 'web',
                'messages' => [
                    [
                        'sender' => 'USER',
                        'message' => 'Namaste Krishi Sahayak, my paddy leaves are turning yellow with brown spots. What should I spray?',
                        'intent' => 'DISEASE_DIAGNOSIS_QUERY',
                    ],
                    [
                        'sender' => 'BOT',
                        'message' => 'Namaste Ramesh ji! Yellow leaves with brown spots in paddy during active tillering phase often indicate Bacterial Leaf Blight or Zinc Deficiency. We recommend uploading a clear photo in the Crop Doctor diagnosis section. For immediate protection, apply PI Saaf Fungicide (2g/L) combined with Aries Chelated Zinc EDTA 12%.',
                        'intent' => 'DISEASE_DIAGNOSIS_RESPONSE',
                    ],
                    [
                        'sender' => 'USER',
                        'message' => 'Is PI Saaf available for home delivery in Karnal?',
                        'intent' => 'PRODUCT_AVAILABILITY_QUERY',
                    ],
                    [
                        'sender' => 'BOT',
                        'message' => 'Yes, PI Saaf (500g) is in stock in our Karnal Warehouse Zone A. Order today for free 24-hour door delivery!',
                        'intent' => 'PRODUCT_AVAILABILITY_RESPONSE',
                    ],
                ]
            ],
            [
                'user_index' => 1, // Biswajit Sarkar
                'channel' => 'web',
                'messages' => [
                    [
                        'sender' => 'USER',
                        'message' => 'What is the subsidized price of Neem Coated Urea per 45kg bag under PM-PRANAM?',
                        'intent' => 'SUBSIDY_PRICE_QUERY',
                    ],
                    [
                        'sender' => 'BOT',
                        'message' => 'The government control price for IFFCO Neem Coated Urea (45 kg bag) is ₹266.50 inclusive of GST. As your KCC verification is active, you are entitled to direct subsidy purchase.',
                        'intent' => 'SUBSIDY_PRICE_RESPONSE',
                    ],
                ]
            ]
        ];

        foreach ($chatsSample as $chatData) {
            $user = $users[$chatData['user_index'] % count($users)];

            $session = ChatSession::create([
                'user_id' => $user->id,
                'session_token' => 'SESS-2026-' . Str::upper(Str::random(8)),
                'channel' => $chatData['channel'],
                'metadata_json' => ['device' => 'Mobile Browser', 'location' => $user->farm_location],
            ]);

            foreach ($chatData['messages'] as $msg) {
                ChatMessage::create([
                    'chat_session_id' => $session->id,
                    'sender' => $msg['sender'],
                    'message' => $msg['message'],
                    'intent' => $msg['intent'],
                ]);
            }
        }
    }
}
