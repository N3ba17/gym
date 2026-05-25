<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use Inertia\Inertia;
use Illuminate\Http\Request;

class AdminRegistrationController extends Controller
{
    public function index(Request $request)
    {
        $query = Registration::query();

        if ($request->has('sector') && $request->sector) {
            $query->where('sector', $request->sector);
        }

        if ($request->has('sex') && $request->sex) {
            $query->where('sex', $request->sex);
        }

        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('employee_id', 'like', "%{$search}%")
                  ->orWhere('sector', 'like', "%{$search}%")
                  ->orWhere('phone_number', 'like', "%{$search}%");
            });
        }

        $registrations = $query->latest()->get();

        $sectors = Registration::distinct()->pluck('sector')->filter()->sort()->values();
        $sexes = Registration::distinct()->pluck('sex')->filter()->sort()->values();

        return Inertia::render('RegistrationsIndex', [
            'registrations' => $registrations,
            'filters' => [
                'sectors' => $sectors,
                'sexes' => $sexes,
            ],
        ]);
    }

    public function update(Request $request, Registration $registration)
    {
        $validated = $request->validate([
            'selected_slots' => 'required|array|max:5',
            'selected_slots.*.day' => 'required|string',
            'selected_slots.*.time' => 'required|string',
        ]);

        $registration->update([
            'selected_slots' => $validated['selected_slots'],
        ]);

        return back()->with('success', 'Slot updated successfully.');
    }

    public function destroy(Registration $registration)
    {
        $registration->delete();

        return back()->with('success', 'Registration deleted.');
    }
}