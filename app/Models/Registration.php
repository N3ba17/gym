<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Registration extends Model
{
    protected $fillable = [
        'name',
        'employee_id',
        'age',
        'sex',
        'sector',
        'phone_number',
        'chronic_illness',
        'selected_slots',
    ];

    protected $casts = [
        'selected_slots' => 'array',
    ];

    public static function getSlotCounts(): array
    {
        return self::all()
            ->flatMap(fn($reg) => collect($reg->selected_slots ?? [])
                ->map(fn($slot) => $slot['day'] . '||' . $slot['time']))
            ->countBy()
            ->toArray();
    }
}