<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Registration;
use App\Models\RegistrationSetting;
use Inertia\Inertia;

class RegistrationController extends Controller
{
    public function index()
    {
        $slots = Registration::all()->flatMap(function ($reg) {
            return collect($reg->selected_slots ?? [])->map(function ($slot) {
                return [
                    'day' => $slot['day'],
                    'time' => $slot['time'],
                ];
            });
        })->groupBy(fn($s) => $s['day'] . '||' . $s['time'])
            ->map(fn($items) => $items->count())
            ->toArray();

        $setting = RegistrationSetting::current();

        return Inertia::render('Registrations', [
            'slotCounts' => $slots,
            'closeAt' => $setting->close_at?->toIso8601String(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'employeeId' => 'required|string',
            'age' => 'required|numeric|between:21,70',
            'sex' => 'required',
            'sector' => 'required',
            'phoneNumber' => 'required',
            'selectedSlots' => 'required|array|min:1|max:3'
        ]);

        Registration::updateOrCreate(
            ['employee_id' => $validated['employeeId']],
            [
                'name' => $validated['name'],
                'age' => $validated['age'],
                'sex' => $validated['sex'],
                'sector' => $validated['sector'],
                'phone_number' => $validated['phoneNumber'],
                'chronic_illness' => $request->chronicIllness,
                'selected_slots' => $validated['selectedSlots'],
            ]
        );

        return back()->with([
            'success' => 'Registration successful!',
        ]);
    }

    public function getSlotCounts()
    {
        $slots = Registration::all()->flatMap(function ($reg) {
            return collect($reg->selected_slots ?? [])->map(function ($slot) {
                return [
                    'day' => $slot['day'],
                    'time' => $slot['time'],
                ];
            });
        })->groupBy(fn($s) => $s['day'] . '||' . $s['time'])
            ->map(fn($items) => $items->count())
            ->toArray();

        return response()->json($slots);
    }

    public function checkCapacity(Request $request)
    {
        $day = $request->query('day');
        $time = $request->query('time');

        if (!$day || !$time) {
            return response()->json([
                'message' => 'Missing day or time',
            ], 400);
        }

        $count = Registration::whereJsonContains('selected_slots', ['day' => $day, 'time' => $time])
            ->count();

        $capacity = 45;
        $available = $capacity - $count;

        return response()->json([
            'day' => $day,
            'time' => $time,
            'occupied' => $count,
            'available' => $available,
            'capacity' => $capacity,
        ]);
    }
}