<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Publicacao extends Model
{
    protected $table = "publicacoes";
    protected $primaryKey = "publicacao_id";
    public $timestamps = false;
    protected $fillable = [
        'usuario_id', 'conteudo', 'link', 'quando', 'tipo_link'
    ];
}
