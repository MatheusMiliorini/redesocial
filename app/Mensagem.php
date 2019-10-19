<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Mensagem extends Model
{
    protected $table = "mensagens";
    protected $primaryKey = "mensagem_id";
    public $timestamps = false;
    protected $fillable = [
        'conversa_id', 'conteudo', 'quando', 'link', 'tipo_link', 'usuario_id', 'correcao', 'quem_corrigiu'
    ];
}
