<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Idioma extends Model
{
    protected $table = "idiomas";
    protected $primaryKey = "idioma_id";
    public $timestamps = false;
    protected $fillable = [
        'nome',
        'bandeira'
    ];
}
