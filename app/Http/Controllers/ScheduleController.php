<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index()
    {
        $registrations = Registration::latest()->get();

        $slots = [];
        $days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        $times = [
            "12:30 AM - 1:30 AM",
            "1:30 AM - 2:30 AM",
            "6:30 AM - 7:30 AM",
            "11:00 AM - 12:00 PM",
            "12:00 PM - 1:00 PM",
            "1:00 PM - 2:00 PM",
        ];

        foreach ($days as $day) {
            foreach ($times as $time) {
                $key = $day . '||' . $time;
                $assigned = [];

                foreach ($registrations as $reg) {
                    foreach (($reg->selected_slots ?? []) as $slot) {
                        if ($slot['day'] === $day && $slot['time'] === $time) {
                            $assigned[] = [
                                'id' => $reg->id,
                                'name' => $reg->name,
                                'employee_id' => $reg->employee_id,
                                'sector' => $reg->sector,
                                'has_illness' => !empty(trim($reg->chronic_illness ?? '')) &&
                                    strtolower(trim($reg->chronic_illness)) !== 'none',
                            ];
                        }
                    }
                }

                $slots[$key] = [
                    'day' => $day,
                    'time' => $time,
                    'count' => count($assigned),
                    'assignees' => $assigned,
                ];
            }
        }

        return Inertia::render('Schedule', [
            'slots' => $slots,
            'days' => $days,
            'times' => $times,
        ]);
    }
}