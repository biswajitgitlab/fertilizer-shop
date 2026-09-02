<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\CropPlan;
use App\Models\CropTemplate;
use App\Models\FertilizerSchedule;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PlannerController extends Controller
{
    public function index(Request $request)
    {
        $plans = CropPlan::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($plans);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'crop_name' => 'required|string',
            'field_area' => 'required|numeric',
            'sowing_date' => 'required|date',
        ]);

        $sowingDate = Carbon::parse($validated['sowing_date']);
        
        // Find templates for this crop
        $templates = CropTemplate::where('crop_name', $validated['crop_name'])
                        ->orderBy('days_after_sowing')
                        ->get();
                        
        if ($templates->isEmpty()) {
            return response()->json(['message' => 'No templates found for this crop.'], 404);
        }

        // Expected harvest can be roughly estimated based on the last stage
        $lastStageDays = $templates->max('days_after_sowing') + 20; // 20 days after last fertilizer
        $expectedHarvest = $sowingDate->copy()->addDays($lastStageDays);

        $plan = CropPlan::create([
            'user_id' => $request->user()->id,
            'crop_name' => $validated['crop_name'],
            'field_area' => $validated['field_area'],
            'sowing_date' => $sowingDate,
            'expected_harvest' => $expectedHarvest,
        ]);

        // Auto-generate fertilizer_schedule based on crop template
        foreach ($templates as $t) {
            $applicationDate = $sowingDate->copy()->addDays($t->days_after_sowing);
            $qty = $t->qty_per_acre * $validated['field_area'];
            
            FertilizerSchedule::create([
                'crop_plan_id' => $plan->id,
                'stage_name' => $t->stage_name,
                'recommended_products' => $t->recommended_products,
                'application_date' => $applicationDate,
                'qty' => $qty,
                'application_method' => $t->application_method,
                'status' => 'PENDING',
            ]);
        }

        return response()->json([
            'message' => 'Crop plan generated successfully.',
            'plan' => $plan->load('fertilizerSchedules')
        ], 201);
    }

    public function show(Request $request, $id)
    {
        $plan = CropPlan::with(['fertilizerSchedules' => function($q) {
            $q->orderBy('application_date');
        }])->where('user_id', $request->user()->id)->findOrFail($id);
        
        return response()->json($plan);
    }

    public function update(Request $request, $id)
    {
        $plan = CropPlan::where('user_id', $request->user()->id)->findOrFail($id);
        
        $validated = $request->validate([
            'crop_name' => 'sometimes|string',
            'field_area' => 'sometimes|numeric',
            'sowing_date' => 'sometimes|date',
            'expected_harvest' => 'sometimes|date',
            'reminders_enabled' => 'sometimes|boolean',
        ]);
        
        $plan->update($validated);
        return response()->json($plan);
    }

    public function destroy(Request $request, $id)
    {
        $plan = CropPlan::where('user_id', $request->user()->id)->findOrFail($id);
        $plan->delete();
        
        return response()->json(['message' => 'Plan deleted']);
    }

    public function markDone(Request $request, $id, $task_id)
    {
        $plan = CropPlan::where('user_id', $request->user()->id)->findOrFail($id);
        
        $task = FertilizerSchedule::where('crop_plan_id', $plan->id)->findOrFail($task_id);
        $task->update(['status' => 'COMPLETED']);
        
        return response()->json(['message' => 'Task marked as completed', 'task' => $task]);
    }

    public function upcomingTasks()
    {
        $tasks = FertilizerSchedule::with('cropPlan.user')
            ->where('status', 'PENDING')
            ->whereDate('application_date', '<=', Carbon::today())
            ->get();
            
        return response()->json($tasks);
    }
}
