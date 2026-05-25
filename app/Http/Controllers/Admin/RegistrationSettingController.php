<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RegistrationSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RegistrationSettingController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/RegistrationSettings', [
            'setting' => RegistrationSetting::current(),
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'is_open' => 'boolean',
            'close_at' => 'nullable|date',
            'open_days' => 'nullable|array',
            'open_days.*' => 'string',
            'open_from' => 'nullable|date_format:H:i',
            'open_to' => 'nullable|date_format:H:i|after:open_from',
            'closed_message' => 'nullable|string|max:500',
        ]);

        $setting = RegistrationSetting::current();
        $setting->update($validated);

        return back()->with('success', 'Registration settings updated.');
    }
}
