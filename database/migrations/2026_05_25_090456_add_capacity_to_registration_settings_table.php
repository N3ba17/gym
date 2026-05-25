<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('registration_settings', function (Blueprint $table) {
            $table->integer('capacity')->default(40);
        });
    }

    public function down(): void
    {
        Schema::table('registration_settings', function (Blueprint $table) {
            $table->dropColumn('capacity');
        });
    }
};
