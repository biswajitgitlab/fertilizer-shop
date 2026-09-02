<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Contracts\NotificationServiceInterface;
use App\Models\CropDiagnosis;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class DiagnosisController extends Controller
{
    public function __construct(
        protected NotificationServiceInterface $notificationService
    ) {}

    /**
     * Format diagnosis record for frontend consumption
     */
    protected function formatDiagnosis(CropDiagnosis $diagnosis): array
    {
        return [
            'id' => (string) $diagnosis->id,
            'userId' => (string) $diagnosis->user_id,
            'crop' => $diagnosis->crop_name,
            'crop_name' => $diagnosis->crop_name,
            'growthStage' => $diagnosis->growth_stage ?? '',
            'location' => $diagnosis->location ?? '',
            'symptoms' => $diagnosis->symptoms_json ?? [],
            'images' => $diagnosis->images_json ?? [],
            'status' => $diagnosis->status ?? 'COMPLETED',
            'title' => $diagnosis->title ?? ($diagnosis->crop_name . ' Diagnostic Report'),
            'confidence' => $diagnosis->confidence_score !== null ? (int)$diagnosis->confidence_score : 88,
            'severity' => $diagnosis->severity ?? 'Medium',
            'description' => $diagnosis->ai_result ?? ('Diagnostic report for ' . $diagnosis->crop_name),
            'causes' => $diagnosis->causes_json ?? [],
            'recommendedProductIds' => array_map('strval', $diagnosis->recommended_products_json ?? []),
            'preventiveMeasures' => $diagnosis->preventive_measures_json ?? [],
            'adminReviewed' => (bool)$diagnosis->admin_reviewed,
            'adminNotes' => $diagnosis->admin_notes,
            'createdAt' => $diagnosis->created_at ? $diagnosis->created_at->toISOString() : now()->toISOString(),
        ];
    }

    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json([], 401);
        }

        // 2-step ID-sort pattern to eliminate MySQL sort buffer memory limits on heavy JSON/BLOB rows
        $ids = $user->cropDiagnoses()
            ->orderBy('created_at', 'desc')
            ->pluck('id');

        if ($ids->isEmpty()) {
            return response()->json([]);
        }

        $diagnosesMap = CropDiagnosis::whereIn('id', $ids)->get()->keyBy('id');
        $diagnoses = $ids->map(fn($id) => $diagnosesMap->get($id))->filter();

        $formatted = $diagnoses->map(fn($d) => $this->formatDiagnosis($d))->values();

        return response()->json($formatted);
    }

    public function show(Request $request, $id)
    {
        $user = $request->user();
        $diagnosis = CropDiagnosis::where('id', $id);
        if ($user) {
            $diagnosis->where('user_id', $user->id);
        }
        $record = $diagnosis->firstOrFail();

        $formatted = $this->formatDiagnosis($record);

        if (!empty($record->recommended_products_json)) {
            $products = \App\Models\Product::whereIn('id', $record->recommended_products_json)->get();
            $formatted['recommendedProductsData'] = $products;
        }

        return response()->json($formatted);
    }

    public function store(Request $request)
    {
        // Support both snake_case and camelCase payloads from frontend
        $cropName = $request->input('crop_name') ?? $request->input('crop');
        if (!$cropName) {
            return response()->json([
                'message' => 'The crop_name or crop field is required.'
            ], 422);
        }

        $growthStage = $request->input('growth_stage') ?? $request->input('growthStage');
        $symptoms = $request->input('symptoms_json') ?? $request->input('symptoms') ?? [];
        $images = $request->input('images_json') ?? $request->input('images') ?? [];
        $location = $request->input('location');
        
        $title = $request->input('title');
        $aiResult = $request->input('ai_result') ?? $request->input('description');
        $confidence = $request->input('confidence_score') ?? $request->input('confidence');
        $severity = $request->input('severity');
        $causes = $request->input('causes_json') ?? $request->input('causes') ?? [];
        $recommendedProducts = $request->input('recommended_products_json') ?? $request->input('recommendedProductIds') ?? $request->input('recommended_products') ?? [];
        $preventiveMeasures = $request->input('preventive_measures_json') ?? $request->input('preventiveMeasures') ?? [];

        $diagnosis = $request->user()->cropDiagnoses()->create([
            'crop_name' => $cropName,
            'title' => $title ?? ($cropName . ' Analysis Report'),
            'growth_stage' => $growthStage,
            'location' => $location,
            'symptoms_json' => is_array($symptoms) ? $symptoms : [$symptoms],
            'causes_json' => is_array($causes) ? $causes : [$causes],
            'images_json' => is_array($images) ? $images : [$images],
            'ai_result' => $aiResult,
            'confidence_score' => $confidence ? (float)$confidence : null,
            'severity' => $severity ?? 'Medium',
            'recommended_products_json' => is_array($recommendedProducts) ? $recommendedProducts : [$recommendedProducts],
            'preventive_measures_json' => is_array($preventiveMeasures) ? $preventiveMeasures : [$preventiveMeasures],
            'status' => 'COMPLETED'
        ]);

        try {
            $this->notificationService->notifyDiagnosisSubmitted($diagnosis);
        } catch (\Throwable $e) {
            Log::error('Failed sending diagnosis submission notification: ' . $e->getMessage());
        }

        // Trigger n8n webhook asynchronously if configured
        try {
            $webhookUrl = env('N8N_DIAGNOSIS_WEBHOOK_URL', 'http://localhost:5678/webhook/diagnosis');
            Http::timeout(3)->post($webhookUrl, [
                'diagnosis_id' => $diagnosis->id,
                'crop_name' => $diagnosis->crop_name,
                'growth_stage' => $diagnosis->growth_stage,
                'symptoms' => $diagnosis->symptoms_json,
                'images' => $diagnosis->images_json,
                'location' => $diagnosis->location,
            ]);
        } catch (\Throwable $e) {
            Log::info('n8n webhook skipped or unreachable: ' . $e->getMessage());
        }

        try {
            if (config('cache.default') === 'redis') {
                $redis = \Illuminate\Support\Facades\Cache::redis();
                foreach ($redis->keys('*report:*') as $key) {
                    $redis->del($key);
                }
            }
        } catch (\Throwable $e) {}

        $formatted = $this->formatDiagnosis($diagnosis);

        return response()->json([
            'message' => 'Diagnosis submitted successfully',
            'diagnosis_id' => (string) $diagnosis->id,
            'data' => $formatted
        ], 201);
    }
}
