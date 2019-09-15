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
            $publicacao->save();
        }

        DB::commit();
    }

    function getPublicacoes(Request $req)
    {
        $publicacoes = [];
        return response()->json($publicacoes);
    }
}
