<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConversasController extends Controller
{
    function listaConversas()
    {
        return view("conversas", [
            "title" => "Conversas"
        ]);
    }

    /**
     * Inicia uma conversa, verificando antes se ela já não existe
     */
    function iniciarConversa(Request $req)
    {
        $dados = $req->validate([
            "usuario_id" => "required|integer|exists:usuarios"
        ]);

        $meuUsuario = session("usuario")->usuario_id;

        $participantes = [(int) $dados['usuario_id'], $meuUsuario];

        $conversa = DB::select("
            WITH aux AS (
                SELECT 
                    ARRAY_AGG(usuario_id order by usuario_id) AS arr
                FROM
                    participantes
                GROUP BY conversa_id) 
            SELECT
                *
            FROM
                aux
            WHERE arr <@ ARRAY[" . \implode(", ", $participantes) . "]
        ");

        if (!$conversa) {
            DB::beginTransaction();

            $criada_em = date("Y-m-d H:i:s");

            // Cria a conversa Pai
            $conversa_id = DB::table("conversas")->insertGetId([
                "criada_em"    => $criada_em,
                "iniciada_por" => $meuUsuario
            ], "conversa_id");

            // Insere os participantes
            DB::table("participantes")->insert([
                ["usuario_id" => $meuUsuario, "conversa_id" => $conversa_id],
                ["usuario_id" => $dados["usuario_id"], "conversa_id" => $conversa_id]
            ]);

            DB::commit();
        } else {
            return response()->json([
                'erro' => "Uma conversa com este(s) usuário(s) já existe!",
            ], 401);
        }
    }

    /**
     * Busca a lista de conversas para o AJAX
     */
    function getConversas()
    {
        $usuario_id = session("usuario")->usuario_id;

        $conversas = DB::select("
            WITH minhas AS (
                SELECT conversa_id FROM participantes WHERE usuario_id = :usuario_id
            )
            SELECT 
                u.nome AS usuario,
                COALESCE('storage/' || u.foto, 'https://api.adorable.io/avatars/256/'|| u.url_unica) AS foto,
                p.conversa_id
            FROM 
                participantes p
                JOIN usuarios u ON 
                p.usuario_id = u.usuario_id
            WHERE 
                p.conversa_id IN (SELECT conversa_id FROM minhas)
                AND p.usuario_id <> :usuario_id
        ", [
            "usuario_id" => $usuario_id
        ]);

        return response()->json($conversas);
    }
}
