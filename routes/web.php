<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Api\RegistrationController;
use App\Http\Controllers\Admin\GymAdminController;
use App\Http\Controllers\AdminRegistrationController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Admin\RegistrationSettingController;


Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/schedule', [ScheduleController::class, 'index'])->name('schedule');
    Route::get('/registrations', [AdminRegistrationController::class, 'index'])->name('registrations.index');
    Route::put('/registrations/{registration}', [AdminRegistrationController::class, 'update'])->name('registrations.update');
    Route::delete('/registrations/{registration}', [AdminRegistrationController::class, 'destroy'])->name('registrations.destroy');

    // Reassign a specific employee
    Route::put('/registrations/{registration}/reassign', [GymAdminController::class, 'updateSlot']);

    Route::get('/admin/registration-settings', [RegistrationSettingController::class, 'index'])->name('admin.registration-settings');
    Route::put('/admin/registration-settings', [RegistrationSettingController::class, 'update']);
});
Route::get('/register-gym', function () {
    $setting = \App\Models\RegistrationSetting::current();

    if ($setting->isRegistrationOpen()) {
        return app(\App\Http\Controllers\Api\RegistrationController::class)->index();
    }

    return \Inertia\Inertia::render('RegistrationClosed', [
        'message' => $setting->closed_message,
    ]);
})->name('gym.register');
Route::post('/register-gym', [RegistrationController::class, 'store']);
Route::get('/api/register-gym/slot-counts', [RegistrationController::class, 'getSlotCounts']);
require __DIR__ . '/settings.php';
