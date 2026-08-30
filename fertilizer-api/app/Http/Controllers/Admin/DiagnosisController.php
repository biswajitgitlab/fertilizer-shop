<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CropDiagnosis;

class DiagnosisController extends Controller
{
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'ai_result' => 'nullable|string',
            'severity' => 'nullable|string',
            'recommended_products' => 'nullable|array',
            'status' => 'nullable|in:PENDING,COMPLETED,REVIEW_NEEDED',
            'admin_notes' => 'nullable|string',
        ]);

        $diagnosis = CropDiagnosis::findOrFail($id);
        
        $data = [
            'admin_reviewed' => true
        ];

        if (array_key_exists('ai_result', $validated)) $data['ai_result'] = $validated['ai_result'];
        if (array_key_exists('severity', $validated)) $data['severity'] = $validated['severity'];
        if (array_key_exists('recommended_products', $validated)) $data['recommended_products_json'] = $validated['recommended_products'];
        if (array_key_exists('status', $validated)) $data['status'] = $validated['status'];
        // Note: admin_notes is not in the migration, let's add it if needed or just skip it.
        // Or we can add it to the migration. I'll add it to the model and migration now.
        if (array_key_exists('admin_notes', $validated)) {
            $data['admin_notes'] = $validated['admin_notes'];
        }

        $diagnosis->update($data);

        \App\Services\NotificationService::notifyDiagnosisReviewed($diagnosis);

        return response()->json($diagnosis);
    }
}
