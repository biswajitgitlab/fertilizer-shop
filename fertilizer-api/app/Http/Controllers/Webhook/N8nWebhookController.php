<?php

namespace App\Http\Controllers\Webhook;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\CropDiagnosis;

class N8nWebhookController extends Controller
{
    public function handleDiagnosisResult(Request $request)
    {
        $validated = $request->validate([
            'diagnosis_id' => 'required|exists:crop_diagnoses,id',
            'ai_result' => 'required|string',
            'confidence' => 'required|numeric',
            'severity' => 'nullable|string',
            'recommended_products' => 'nullable|array',
        ]);

        $diagnosis = CropDiagnosis::findOrFail($validated['diagnosis_id']);

        $status = 'COMPLETED';
        if ($validated['confidence'] < 60) {
            $status = 'REVIEW_NEEDED';
        }

        $diagnosis->update([
            'ai_result' => $validated['ai_result'],
            'confidence_score' => $validated['confidence'],
            'severity' => $validated['severity'] ?? null,
            'recommended_products_json' => $validated['recommended_products'] ?? [],
            'status' => $status
        ]);

        return response()->json(['message' => 'Diagnosis result updated successfully']);
    }

    public function handleChatReply(Request $request)
    {
        $validated = $request->validate([
            'session_id' => 'required|exists:chat_sessions,id',
            'message' => 'required|string',
        ]);
        
        $chatMessage = \App\Models\ChatMessage::create([
            'chat_session_id' => $validated['session_id'],
            'sender' => 'BOT',
            'message' => $validated['message']
        ]);
        
        return response()->json(['message' => 'Chat saved successfully', 'data' => $chatMessage]);
    }
}
