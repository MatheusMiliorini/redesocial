<?php

namespace App\Http\Controllers;

use App\Mensagem;
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

    function enviaMensagem(Request $req)
    {
        $dados = $req->validate([
            'conversa_id' => 'required|integer|exists:conversas',
            "mensagem"    => "nullable",
            "anexo"       => "nullable|file",
        ]);

        $mimeType = null;

        // Verifica se tem anexo ou mensagem
        if (!isset($dados['anexo']) && \is_null($dados['mensagem'])) {
            return response()->json([
                "erro" => "Por favor, insera um texto ou um anexo para enviar a mensagem!",
            ], 401);
        }

        // Verifica se o anexo é foto ou vídeo
        if (isset($_FILES['anexo'])) {
            // Valida o formato
            $mimeType = mime_content_type($_FILES['anexo']['tmp_name']);
            if (strpos($mimeType, 'image') === false && strpos($mimeType, 'video') === false) {
                return response()->json([
                    "erro" => "Por favor, somente formatos de imagem e vídeo são suportados."
                ], 401);
            }

            // Valida o tamanho
            if ($_FILES['anexo']['size'] > 8000000) {
                return response()->json([
                    "erro" => "Por favor, apenas arquivos com até 8MB são suportados."
                ], 401);
            }
        }

        DB::beginTransaction();

        $mensagem = new Mensagem();
        $mensagem->conversa_id = $dados['conversa_id'];
        $mensagem->usuario_id = session("usuario")->usuario_id;
        $mensagem->conteudo = $dados['mensagem'];
        $mensagem->quando = date("Y-m-d H:i:s");
        $mensagem->save();
        if (isset($_FILES['anexo'])) {
            $mensagem->link = $dados['anexo']->store("conversas/" . $mensagem->conversa_id);
            $mensagem->tipo_link = $mimeType;
            $mensagem->save();
        }

        DB::commit();
    }

    /**
     * Busca as mensagens daquela conversa
     */
    function getMensagens(int $conversa_id)
    {
        $meuUsuario = session("usuario")->usuario_id;

        // Verifica se o usuário participa desta conversa
        $participa = DB::select("SELECT conversa_id FROM participantes WHERE conversa_id = ? AND usuario_id = ?", [
            $conversa_id,
            $meuUsuario
        ]);

        if (!$participa) {
            return response()->json([
                "erro" => "Você não participa desta conversa!",
            ], 401);
        }

        $mensagens = DB::select("
            SELECT
                m.conteudo,
                m.quando,
                m.link,
                m.tipo_link,
                m.correcao,
                u.nome,
                COALESCE('/storage/' || u.foto, 'https://api.adorable.io/avatars/256/' || u.url_unica) AS foto,
                u2.nome AS quem_corrigiu,
                CASE WHEN u.usuario_id = ? THEN TRUE ELSE FALSE END AS \"minhaMensagem\"
            FROM
                mensagens m
            JOIN usuarios u ON
                u.usuario_id = m.usuario_id
            LEFT JOIN usuarios u2 ON
                u2.usuario_id = m.quem_corrigiu
            WHERE
                m.conversa_id = ?
        ", [
            $meuUsuario,
            $conversa_id
        ]);

        return response()->json($mensagens);
    }
}
