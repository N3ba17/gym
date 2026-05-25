<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Registration;
use Inertia\Inertia;
class GymAdminController extends Controller
{
    public function index()
    {
        // For the Dashboard Breakdown
        return response()->json([
            'total_registrations' => Registration::count(),
            'sector_breakdown' => Registration::select('sector', \DB::raw('count(*) as total'))
                ->groupBy('sector')->get(),
            'employees' => Registration::latest()->get()
        ]);
    }

    public function updateSlot(Request $request, Registration $registration)
    {
        $validated = $request->validate([
            'selectedSlots' => 'required|array|max:5'
        ]);

        $registration->update([
            'selected_slots' => $validated['selectedSlots']
        ]);

        return response()->json(['message' => 'Reassigned successfully']);
    }
}
