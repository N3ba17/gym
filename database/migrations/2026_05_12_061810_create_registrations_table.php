<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('registrations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('employee_id')->unique();
            $table->integer('age');
            $table->string('sex');
            $table->string('sector');
            $table->string('phone_number');
            $table->text('chronic_illness')->nullable();
            $table->json('selected_slots'); // Stores array of {day, time}
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};
