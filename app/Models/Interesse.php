<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Interesse extends Model
{
    protected $table = "interesses";
    protected $primaryKey = "interesse_id";
    public $timestamps = false;
    protected $fillable = [
        'nome'
    ];
}
