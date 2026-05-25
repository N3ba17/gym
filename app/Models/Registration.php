<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Registration extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
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
}