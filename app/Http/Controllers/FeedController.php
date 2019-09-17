<?php

namespace App\Http\Controllers;

use App\Models\Publicacao;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
        $publicacao->save();
        if (isset($_FILES['anexo'])) {
            $publicacao->link = $dados['anexo']->store("publicacoes/" . $publicacao->publicacao_id);
            $publicacao->tipo_link = $mimeType;
            $publicacao->save();
        }

        DB::commit();
    }

    function getPublicacoes(Request $req)
    {
        $publicacoes = DB::select("
            SELECT 
                pu.publicacao_id,
                pu.conteudo,
                pu.quando,
                pu.tipo_link,
                'storage/'||pu.link AS link,
                u.nome AS usuario,
                'storage/'||u.foto AS foto
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
}
