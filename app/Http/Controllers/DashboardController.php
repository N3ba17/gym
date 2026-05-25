<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the administration dashboard with registration statistics.
     */
    public function index()
    {
        $registrations = Registration::latest()->get();

        // 1. KPI Calculations
        $total = $registrations->count();
        $todayRegistrations = Registration::whereDate('created_at', Carbon::today())->count();
        $avgAge = $registrations->avg('age') ?? 0;
        $totalSlotSelections = $registrations->sum(fn($r) => count($r->selected_slots ?? []));
        $illnessCount = $registrations->filter(function ($r) {
            $val = strtolower(trim($r->chronic_illness ?? ''));
            return !empty($val) && $val !== 'none';
        })->count();

        // Calculate illness percentage
        $illnessPct = $total > 0 ? round(($illnessCount / $total) * 100, 1) : 0;

        // 2. Charts Data
        $trendSeries = Registration::select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')->orderBy('date')->get()
            ->map(fn($item) => ['day' => Carbon::parse($item->date)->format('M d'), 'registrations' => $item->count]);

        $sectorSeries = Registration::select('sector', DB::raw('count(*) as count'))
            ->groupBy('sector')->orderBy('count', 'desc')->get();

        $sexSeries = Registration::select('sex', DB::raw('count(*) as count'))
            ->groupBy('sex')->get()
            ->map(fn($item) => ['sex' => $item->sex, 'count' => $item->count]);

        $ageBandSeries = [

            ['band' => '21-29', 'count' => $registrations->whereBetween('age', [21, 29])->count()],
            ['band' => '30-39', 'count' => $registrations->whereBetween('age', [30, 39])->count()],
            ['band' => '40-49', 'count' => $registrations->whereBetween('age', [40, 49])->count()],
            ['band' => '50-59', 'count' => $registrations->whereBetween('age', [50, 59])->count()],
            ['band' => '60+', 'count' => $registrations->where('age', '>=', 60)->count()],


        ];

        // 3. Slot Utilization Heatmap Data
        $slotCounts = [];
        foreach ($registrations as $reg) {
            foreach (($reg->selected_slots ?? []) as $slot) {
                $key = $slot['day'] . '||' . $slot['time'];
                $slotCounts[$key] = ($slotCounts[$key] ?? 0) + 1;
            }
        }

        // IMPORTANT: Component name must match your file name case exactly
        return Inertia::render('dashboard', [
            'registrations' => $registrations->take(15),
            'stats' => [
                'total' => $total,
                'todayRegistrations' => $todayRegistrations,
                'totalSlotSelections' => $totalSlotSelections,
                'avgAge' => round($avgAge, 1),
                'illnessCount' => $illnessCount,
                'illnessPct' => $illnessPct,
            ],
            'charts' => [
                'trend' => $trendSeries,
                'sectors' => $sectorSeries,
                'sex' => $sexSeries,
                'ageBands' => $ageBandSeries,
                'slotHeat' => $slotCounts,
            ]
        ]);
    }

    /**
     * Optional: Delete a registration
     */
    public function destroy(Registration $registration)
    {
        $registration->delete();

        return back()->with('success', 'Registration removed successfully.');
    }
}