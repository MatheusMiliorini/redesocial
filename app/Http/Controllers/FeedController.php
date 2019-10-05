<?php

namespace App\Http\Controllers;

use App\Models\Publicacao;
use App\Models\RespostaPublicacao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class FeedController extends Controller
{
    function mostraFeed()
    {
        return view("feed", [
            "title" => "Feed",
        ]);
    }

    /**
     * Salva a publicação do usuário
     */
    function addPublicao(Request $req)
    {
        $dados =  $req->validate([
            "conteudo"  => "required",
            "anexo"     => "nullable",
            "nomeAnexo" => "nullable",
        ]);

        $mimeType = null;

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

        $publicacao = new Publicacao();
        $publicacao->usuario_id = session("usuario")->usuario_id;
        $publicacao->conteudo = $dados['conteudo'];
        $publicacao->quando = date("Y-m-d H:i:s");
        $publicacao->save();
        if (isset($_FILES['anexo'])) {
            $publicacao->link = $dados['anexo']->store("publicacoes/" . $publicacao->publicacao_id);
            $publicacao->tipo_link = $mimeType;
            $publicacao->save();
        }

        DB::commit();
    }

    function getPublicacoes()
    {
        $publicacoes = DB::select("
            SELECT 
                pu.publicacao_id,
                pu.conteudo,
                pu.quando,
                pu.tipo_link,
                'storage/'||pu.link AS link,
                u.nome AS usuario,
                u.url_unica,
                COALESCE('storage/' || u.foto, 'https://api.adorable.io/avatars/256/'|| u.url_unica) AS foto,
                CASE WHEN pu.usuario_id = :usuario_id THEN TRUE ELSE FALSE END AS minha_publicacao,
                CASE WHEN (
                    SELECT COUNT(*) AS liked
                    FROM likes_publicacao
                    WHERE usuario_id = :usuario_id
                    AND publicacao_id = pu.publicacao_id
                ) > 0 THEN TRUE ELSE FALSE END AS liked,
                (
                    SELECT count(*)
                    FROM likes_publicacao lp
                    WHERE lp.publicacao_id = pu.publicacao_id
                ) AS likes
            FROM 
                publicacoes pu
            JOIN usuarios u ON 
                u.usuario_id = pu.usuario_id
            WHERE 
                u.usuario_id = :usuario_id
                OR u.usuario_id IN (
                    SELECT c.segue
                    FROM conexoes c
                    WHERE c.seguidor = :usuario_id
                )
            ORDER BY pu.quando DESC
        ", [
            "usuario_id" => session('usuario')->usuario_id
        ]);

        return response()->json($publicacoes);
    }

    /**
     * Verifica se a publicação é do usuário que solicitou a exclusão e deleta
     * @param int $publicacao_id
     */
    function deletaPublicao(int $publicacao_id)
    {
        $publicacao = Publicacao::find($publicacao_id);
        if ($publicacao->usuario_id === session("usuario")->usuario_id) {
            $publicacao->delete();

            Storage::deleteDirectory("publicacoes/{$publicacao_id}");

            return response()->json([
                "status" => "success",
            ]);
        } else {
            return \response()->json([
                "erro" => "Você não pode deletar esta publicação!",
            ], 401);
        }
    }

    /**
     * Curti ou descurte uma publicação
     * @param int $publicacao_id
     */
    function curtirPublicacao(int $publicacao_id)
    {
        $like = DB::select("
            SELECT *
            FROM likes_publicacao
            WHERE usuario_id = :usuario_id
            AND publicacao_id = :publicacao_id
        ", [
            'usuario_id' => session("usuario")->usuario_id,
            'publicacao_id' => $publicacao_id,
        ]);

        if (!$like) {
            // Cria o like
            DB::insert("
                INSERT INTO likes_publicacao(usuario_id, publicacao_id) VALUES (?, ?)
            ", [
                session("usuario")->usuario_id,
                $publicacao_id
            ]);
        } else {
            // Remove o like
            DB::delete("
                DELETE FROM likes_publicacao
                WHERE usuario_id = ? AND publicacao_id = ?
            ", [
                session("usuario")->usuario_id,
                $publicacao_id
            ]);
        }
    }

    /**
     * Retorna os comentários de uma publicação
     * @param int $publicacao_id
     * @return array
     */
    function getComentarios(int $publicacao_id)
    {
        $dados = DB::select("
            SELECT
                rp.publicacao_id,
                rp.rp_id,
                rp.conteudo,
                rp.quando,
                rp.tipo_link,
                '/storage/' || rp.link AS link,
                u.nome AS usuario,
                COALESCE('/storage/' || u.foto, 'https://api.adorable.io/avatars/256/'|| u.url_unica) AS foto,
                CASE WHEN rp.usuario_id = :usuario_id THEN TRUE ELSE FALSE END AS minha_publicacao 
            FROM
                respostas_publicacao rp
            JOIN usuarios u ON
                rp.usuario_id = u.usuario_id
            WHERE 
                rp.publicacao_id = :publicacao_id
            ORDER BY 
                quando DESC
        ", [
            'publicacao_id' => $publicacao_id,
            'usuario_id' => session('usuario')->usuario_id,
        ]);

        return response()->json($dados);
    }

    /**
     * Salva um comentário em uma publicacação
     */
    function salvaComentario(Request $req, int $publicacao_id)
    {
        $dados =  $req->validate([
            "conteudo"  => "required",
            "anexo"     => "nullable",
            "nomeAnexo" => "nullable",
        ]);

        $mimeType = null;

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

        $rp = new RespostaPublicacao();
        $rp->publicacao_id = $publicacao_id;
        $rp->usuario_id = session("usuario")->usuario_id;
        $rp->conteudo = $dados['conteudo'];
        $rp->quando = date("Y-m-d H:i:s");
        $rp->save();
        if (isset($_FILES['anexo'])) {
            $rp->link = $dados['anexo']->store("publicacoes/" . $rp->publicacao_id . "/respostas");
            $rp->tipo_link = $mimeType;
            $rp->save();
        }

        DB::commit();
    }

    /**
     * Exclui o comentário criado por um usuário
     * @param int $rp_id
     */
    function excluiComentario(int $rp_id)
    {
        $rp = RespostaPublicacao::where('rp_id', $rp_id)->where('usuario_id', session('usuario')->usuario_id)->first();

        if (!$rp) {
            return response()->json([
                'erro' => 'Resposta não encontrada!',
            ], 404);
        }

        $link = $rp->link;
        $rp->delete();
        if ($link) {
            Storage::delete($link);
        }

        return response()->json([
            'status' => 'success',
        ]);
    }
}
