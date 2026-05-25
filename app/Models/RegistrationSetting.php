<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RegistrationSetting extends Model
{
    protected $fillable = [
        'is_open',
        'close_at',
        'open_days',
        'open_from',
        'open_to',
        'closed_message',
    ];

    protected $casts = [
        'is_open' => 'boolean',
        'close_at' => 'datetime',
        'open_days' => 'array',
    ];

    public static function current(): self
    {
        return self::firstOrCreate([], [
            'is_open' => true,
        ]);
    }

    public function isRegistrationOpen(): bool
    {
        if (!$this->is_open) {
            return false;
        }

        if ($this->close_at && now()->greaterThanOrEqualTo($this->close_at)) {
            return false;
        }

        if ($this->open_days && !in_array(now()->format('l'), $this->open_days)) {
            return false;
        }

        if ($this->open_from && $this->open_to) {
            $now = now()->format('H:i');
            if ($now < $this->open_from || $now > $this->open_to) {
                return false;
            }
        }

        return true;
    }
}
