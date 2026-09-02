<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ChatSession;
use App\Models\ChatMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

class ChatController extends Controller
{
    public function start(Request $request)
    {
        $token = Str::uuid()->toString();
        
        $session = ChatSession::create([
            'user_id' => auth('sanctum')->id(), // null if guest
            'session_token' => $token,
            'channel' => 'web',
        ]);

        return response()->json([
            'session_token' => $token,
            'session_id' => $session->id
        ]);
    }

    public function message(Request $request)
    {
        $request->validate([
            'session_token' => 'required|exists:chat_sessions,session_token',
            'message' => 'required|string',
        ]);

        $session = ChatSession::where('session_token', $request->session_token)->firstOrFail();

        $userMessage = ChatMessage::create([
            'chat_session_id' => $session->id,
            'sender' => 'USER',
            'message' => $request->message,
        ]);

        // Forward to n8n webhook asynchronously
        try {
            Http::timeout(3)->post(env('N8N_CHAT_WEBHOOK_URL', 'http://localhost:5678/webhook/chat-webhook'), [
                'session_id' => $session->id,
                'message' => $request->message,
                'user_id' => $session->user_id,
            ]);
        } catch (\Exception $e) {
            // Fail silently, maybe log it
        }

        return response()->json(['status' => 'sent', 'message' => $userMessage]);
    }

    public function history($token)
    {
        $session = ChatSession::where('session_token', $token)->firstOrFail();
        $messages = ChatMessage::where('chat_session_id', $session->id)
            ->orderBy('created_at', 'asc')
            ->get();
            
        return response()->json($messages);
    }
}
