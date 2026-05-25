<?php

namespace Database\Seeders;

use App\Models\Registration;
use Illuminate\Database\Seeder;

class SlotTestSeeder extends Seeder
{
    private const SECTORS = [
        'BDE', 'TCD', 'Water and Engineering', 'Finance', 'Labratory',
        'Surveying and Geospatial', 'Geotechnical', 'Soil', 'Construction',
    ];

    private const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    private const TIMES = [
        '12:30 AM - 1:30 AM',
        '1:30 AM - 2:30 AM',
        '6:30 AM - 7:30 AM',
        '11:00 AM - 12:00 PM',
        '12:00 PM - 1:00 PM',
        '1:00 PM - 2:00 PM',
    ];

    private const FIRST_NAMES = [
        'Abebe', 'Mekdes', 'Tadesse', 'Hiwot', 'Alemu', 'Biruk', 'Selam',
        'Yonas', 'Frehiwot', 'Solomon', 'Hanna', 'Tekle', 'Meron', 'Kebede',
        'Tsion', 'Ephrem', 'Birtukan', 'Dawit', 'Zewditu', 'Henok',
    ];

    private const LAST_NAMES = [
        'Kebede', 'Lemma', 'Tadesse', 'Wondimu', 'Haile', 'Desta', 'Tesfaye',
        'Mekonnen', 'Alemayehu', 'Girma', 'Assefa', 'Belay', 'Worku', 'Shiferaw',
        'Fikru', 'Getachew', 'Demissie', 'Abate', 'Mulugeta', 'Berhane',
    ];

    private const ILLNESSES = [
        null, null, null, null, null, null, null,
        'Asthma (mild)',
        'Hypertension - on medication',
        'Diabetes Type 2',
        'Lower back pain - chronic',
        'None',
        'none',
        '',
    ];

    public function run(): void
    {
        $slotsByDay = $this->buildSlotPool();
        $totalSlots = count($slotsByDay);
        $registrationCount = 80;

        for ($i = 0; $i < $registrationCount; $i++) {
            $name = self::FIRST_NAMES[array_rand(self::FIRST_NAMES)]
                . ' ' . self::LAST_NAMES[array_rand(self::LAST_NAMES)];

            $slotCount = rand(1, 3);
            $usedDays = [];
            $selectedSlots = [];

            for ($s = 0; $s < $slotCount; $s++) {
                $available = array_filter($slotsByDay, fn($key) => !in_array($key, $usedDays), ARRAY_FILTER_USE_KEY);
                if (empty($available)) break;

                $day = array_rand($available);
                $time = $available[$day][array_rand($available[$day])];
                $selectedSlots[] = ['day' => $day, 'time' => $time];
                $usedDays[] = $day;
            }

            $illness = self::ILLNESSES[array_rand(self::ILLNESSES)];
            $chronicIllness = ($illness !== null && $illness !== '' && strtolower($illness) !== 'none')
                ? $illness
                : null;

            Registration::create([
                'name' => $name,
                'employee_id' => 'EMP-' . str_pad((string) rand(1, 9999), 4, '0', STR_PAD_LEFT),
                'age' => rand(21, 65),
                'sex' => rand(0, 1) ? 'Male' : 'Female',
                'sector' => self::SECTORS[array_rand(self::SECTORS)],
                'phone_number' => '+251 9' . rand(11, 99) . ' ' . rand(100, 999) . ' ' . rand(100, 999),
                'chronic_illness' => $chronicIllness,
                'selected_slots' => $selectedSlots,
                'created_at' => now()->subDays(rand(0, 30))->subHours(rand(0, 23)),
                'updated_at' => now()->subDays(rand(0, 5)),
            ]);
        }

        $this->command?->info("Seeded {$registrationCount} registrations across {$totalSlots} time slots.");
    }

    private function buildSlotPool(): array
    {
        $pool = [];
        $slotIndex = 0;

        foreach (self::DAYS as $day) {
            foreach (self::TIMES as $time) {
                $pool[$day][] = $time;
            }
        }

        // Distribute extra registrations to push slots into specific density ranges
        $this->fillToTargets($pool);

        return $pool;
    }

    private function fillToTargets(array $pool): void
    {
        $targets = [
            // day => [time => target_count]
            'Monday'    => ['12:30 AM - 1:30 AM' => 42, '1:30 AM - 2:30 AM' => 38, '6:30 AM - 7:30 AM' => 28],
            'Tuesday'   => ['11:00 AM - 12:00 PM' => 35, '12:00 PM - 1:00 PM' => 20, '1:00 PM - 2:00 PM' => 8],
            'Wednesday' => ['12:30 AM - 1:30 AM' => 5, '1:30 AM - 2:30 AM' => 12, '6:30 AM - 7:30 AM' => 25],
            'Thursday'  => ['11:00 AM - 12:00 PM' => 40, '12:00 PM - 1:00 PM' => 45, '1:00 PM - 2:00 PM' => 30],
            'Friday'    => ['12:30 AM - 1:30 AM' => 15, '1:30 AM - 2:30 AM' => 22, '6:30 AM - 7:30 AM' => 33],
            'Saturday'  => ['11:00 AM - 12:00 PM' => 48, '12:00 PM - 1:00 PM' => 36, '1:00 PM - 2:00 PM' => 3],
        ];

        foreach ($targets as $day => $times) {
            foreach ($times as $time => $targetCount) {
                for ($i = 0; $i < $targetCount; $i++) {
                    $name = 'Overflow ' . self::FIRST_NAMES[array_rand(self::FIRST_NAMES)]
                        . ' ' . self::LAST_NAMES[array_rand(self::LAST_NAMES)];

                    Registration::create([
                        'name' => $name,
                        'employee_id' => 'TEMP-' . str_pad((string) rand(10000, 99999), 5, '0', STR_PAD_LEFT),
                        'age' => rand(22, 55),
                        'sex' => rand(0, 1) ? 'Male' : 'Female',
                        'sector' => self::SECTORS[array_rand(self::SECTORS)],
                        'phone_number' => '+251 9' . rand(11, 99) . ' ' . rand(100, 999) . ' ' . rand(100, 999),
                        'chronic_illness' => null,
                        'selected_slots' => [['day' => $day, 'time' => $time]],
                        'created_at' => now()->subDays(rand(0, 15)),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }
}
