<?php

namespace Database\Seeders;

use App\Models\RegistrationSetting;
use Illuminate\Database\Seeder;

class RegistrationSettingSeeder extends Seeder
{
    public function run(): void
    {
        RegistrationSetting::create([
            'is_open' => true,
            'close_at' => null,
            'open_days' => null,
            'open_from' => null,
            'open_to' => null,
            'closed_message' => null,
        ]);

        $this->command?->info('Registration settings seeded: registration is open by default.');
    }
}
