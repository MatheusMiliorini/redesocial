<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RespostaPublicacao extends Model
{
    protected $table = "respostas_publicacao";
    protected $primaryKey = "rp_id";
    public $timestamps = false;
    protected $fillable = [
        'publicacao_id', 'usuario_id', 'conteudo', 'link', 'quando', 'tipo_link'
    ];
}
