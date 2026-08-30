<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CropDiagnosis;
use Illuminate\Support\Facades\Http;

class DiagnosisController extends Controller
{
    public function index(Request $request)
    {
        $diagnoses = $request->user()->cropDiagnoses()->orderBy('created_at', 'desc')->get();
        return response()->json($diagnoses);
    }

    public function show(Request $request, $id)
    {
        $diagnosis = $request->user()->cropDiagnoses()->findOrFail($id);
        
        // If recommended_products_json has data, we can optionally fetch the products
        if ($diagnosis->recommended_products_json) {
            $products = \App\Models\Product::whereIn('id', $diagnosis->recommended_products_json)->get();
            $diagnosis->recommended_products = $products;
        }

        return response()->json($diagnosis);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'crop_name' => 'required|string|max:255',
            'growth_stage' => 'nullable|string|max:255',
            'symptoms' => 'nullable|array',
            'images' => 'nullable|array',
            'location' => 'nullable|string|max:255',
        ]);

        $diagnosis = $request->user()->cropDiagnoses()->create([
            'crop_name' => $validated['crop_name'],
            'growth_stage' => $validated['growth_stage'] ?? null,
            'location' => $validated['location'] ?? null,
            'symptoms_json' => $validated['symptoms'] ?? [],
            'images_json' => $validated['images'] ?? [],
            'status' => 'PENDING'
        ]);

        \App\Services\NotificationService::notifyDiagnosisSubmitted($diagnosis);

        // Trigger n8n webhook for AI analysis
        try {
            Http::post(env('N8N_DIAGNOSIS_WEBHOOK_URL', 'http://localhost:5678/webhook/diagnosis'), [
                'diagnosis_id' => $diagnosis->id,
                'crop_name' => $diagnosis->crop_name,
                'growth_stage' => $diagnosis->growth_stage,
                'symptoms' => $diagnosis->symptoms_json,
                'images' => $diagnosis->images_json,
                'location' => $diagnosis->location,
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to trigger n8n diagnosis webhook: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Diagnosis submitted successfully',
            'diagnosis_id' => $diagnosis->id
        ], 201);
    }
}
