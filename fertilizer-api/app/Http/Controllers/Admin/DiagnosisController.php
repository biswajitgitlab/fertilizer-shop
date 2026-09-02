<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CropDiagnosis;
use Illuminate\Support\Facades\Log;

class DiagnosisController extends Controller
{
    protected function formatDiagnosis(CropDiagnosis $diagnosis): array
    {
        return [
            'id' => (string) $diagnosis->id,
            'userId' => (string) $diagnosis->user_id,
            'userName' => $diagnosis->user?->name ?? 'Farmer User',
            'crop' => $diagnosis->crop_name,
            'crop_name' => $diagnosis->crop_name,
            'growthStage' => $diagnosis->growth_stage ?? '',
            'location' => $diagnosis->location ?? '',
            'symptoms' => $diagnosis->symptoms_json ?? [],
            'images' => $diagnosis->images_json ?? [],
            'status' => $diagnosis->status ?? 'COMPLETED',
            'title' => $diagnosis->title ?? ($diagnosis->crop_name . ' Scan'),
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
        // 2-step ID-sort pattern to eliminate MySQL sort buffer memory limits on heavy JSON/BLOB rows
        $ids = CropDiagnosis::orderBy('created_at', 'desc')->pluck('id');

        if ($ids->isEmpty()) {
            return response()->json([]);
        }

        $diagnosesMap = CropDiagnosis::with('user')->whereIn('id', $ids)->get()->keyBy('id');
        $diagnoses = $ids->map(fn($id) => $diagnosesMap->get($id))->filter();

        $formatted = $diagnoses->map(fn($d) => $this->formatDiagnosis($d))->values();

        return response()->json($formatted);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'ai_result' => 'nullable|string',
            'title' => 'nullable|string',
            'severity' => 'nullable|string',
            'recommended_products' => 'nullable|array',
            'recommendedProductIds' => 'nullable|array',
            'preventive_measures' => 'nullable|array',
            'preventiveMeasures' => 'nullable|array',
            'status' => 'nullable|in:PENDING,COMPLETED,REVIEW_NEEDED',
            'admin_notes' => 'nullable|string',
            'adminNotes' => 'nullable|string',
            'adminReviewed' => 'nullable|boolean',
            'admin_reviewed' => 'nullable|boolean',
        ]);

        $diagnosis = CropDiagnosis::findOrFail($id);
        
        $data = [
            'admin_reviewed' => true
        ];

        if (array_key_exists('ai_result', $validated)) $data['ai_result'] = $validated['ai_result'];
        if (array_key_exists('title', $validated)) $data['title'] = $validated['title'];
        if (array_key_exists('severity', $validated)) $data['severity'] = $validated['severity'];
        
        $recs = $validated['recommended_products'] ?? $validated['recommendedProductIds'] ?? null;
        if ($recs !== null) $data['recommended_products_json'] = $recs;

        $prevs = $validated['preventive_measures'] ?? $validated['preventiveMeasures'] ?? null;
        if ($prevs !== null) $data['preventive_measures_json'] = $prevs;

        if (array_key_exists('status', $validated)) $data['status'] = $validated['status'];
        
        $notes = $validated['admin_notes'] ?? $validated['adminNotes'] ?? null;
        if ($notes !== null) $data['admin_notes'] = $notes;

        if (isset($validated['adminReviewed'])) $data['admin_reviewed'] = $validated['adminReviewed'];
        if (isset($validated['admin_reviewed'])) $data['admin_reviewed'] = $validated['admin_reviewed'];

        $diagnosis->update($data);

        try {
            app(\App\Contracts\NotificationServiceInterface::class)->notifyDiagnosisReviewed($diagnosis);
        } catch (\Throwable $e) {
            Log::error('Failed sending diagnosis review notification: ' . $e->getMessage());
        }

        try {
            if (config('cache.default') === 'redis') {
                $redis = \Illuminate\Support\Facades\Cache::redis();
                foreach ($redis->keys('*report:*') as $key) {
                    $redis->del($key);
                }
            }
        } catch (\Throwable $e) {}

        return response()->json($this->formatDiagnosis($diagnosis->fresh(['user'])));
    }
}
