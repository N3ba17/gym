<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Yemisrach Nigusse',
            'email' => 'yemisrachn@eeigconstruction.com',
            'password' => bcrypt('EEC_Admin@2027!'),
            'remember_token' => 'sometoken',
            'email_verified_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        //$this->call(SlotTestSeeder::class);
        $this->call(RegistrationSettingSeeder::class);
    }
}
