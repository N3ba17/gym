<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $setting = RegistrationSetting::current();

        if (!$setting->isRegistrationOpen()) {
            return back()->withErrors([
                'closed' => 'Registration is currently closed.',
            ]);
        }

        $validated = $request->validate([
            'name' => 'required|string',
            'employeeId' => 'required|string',
            'age' => 'required|numeric|between:21,70',
            'sex' => 'required',
            'sector' => 'required',
            'phoneNumber' => 'required',
            'selectedSlots' => 'required|array|min:1|max:3'
        ]);

        $capacity = $setting->capacity ?? 40;

        DB::beginTransaction();

        try {
            foreach ($validated['selectedSlots'] as $slot) {
                $count = Registration::whereRaw(
                    "EXISTS (SELECT 1 FROM json_each(selected_slots) WHERE json_extract(value, '$.day') = ? AND json_extract(value, '$.time') = ?)",
                    [$slot['day'], $slot['time']]
                )->count();

                if ($count >= $capacity) {
                    DB::rollBack();

                    return back()->withErrors([
                        'selectedSlots' => "The slot {$slot['day']} {$slot['time']} is full.",
                    ]);
                }
            }

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

            DB::commit();

            return back()->with([
                'success' => 'Registration successful!',
            ]);
        } catch (\Throwable $e) {
            DB::rollBack();

            throw $e;
        }
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

        $count = Registration::whereRaw(
            "EXISTS (SELECT 1 FROM json_each(selected_slots) WHERE json_extract(value, '$.day') = ? AND json_extract(value, '$.time') = ?)",
            [$day, $time]
        )->count();

        $capacity = RegistrationSetting::current()->capacity ?? 40;
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