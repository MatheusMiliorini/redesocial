<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Usuario extends Model
{
    protected $table = "usuarios";
    protected $primaryKey = "usuario_id";
    public $timestamps = false;
    protected $fillable = [
        'nome', 'email', 'senha', 'foto', 'localizacao', 'nascimento', 'site', 'biografia',
        'url_unica', 'completou_login', 'token_recuperacao'
    ];
}
