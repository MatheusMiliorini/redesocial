<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ConexoesController extends Controller
{
    function telaConexoes()
    {
        return view("conexoes", [
            "title" => "Conexões"
        ]);
    }

    function buscaUsuarios(Request $req)
    {
        $dados = $req->validate([
            "pesquisa" => "required|string"
        ]);

        // Busca os usuários com base na busca, e também busca seus idiomas
        $usuarios = DB::select("
            WITH eu_sigo AS (
                SELECT segue
                FROM conexoes
                WHERE seguidor = :usuario_id
            )
            SELECT 
                u.usuario_id,
                u.nome,
                '/storage/'||u.foto AS foto,
                u.localizacao,
                u.url_unica,
                json_agg(
                    json_build_object(
                        'idioma', i.nome,
                        'nivel_conhecimento', us.nivel_conhecimento
                    )
                ORDER BY i.nome)::TEXT AS idiomas,
                ints.nome AS interesses,
                CASE WHEN u.usuario_id IN (SELECT * FROM eu_sigo) THEN TRUE ELSE FALSE END AS seguindo
            FROM usuarios u
            JOIN idiomas_usuarios us ON
                us.usuario_id = u.usuario_id
            JOIN IDIOMAS i ON
                i.idioma_id = us.idioma_id
            LEFT JOIN (
                SELECT 
                    usuario_id, 
                    JSON_AGG(interesses.nome)::TEXT AS nome
                FROM interesses_usuarios
                JOIN interesses ON 
                    interesses_usuarios.interesse_id = interesses.interesse_id	
                GROUP BY usuario_id
            ) ints ON 
                u.usuario_id = ints.usuario_id
            WHERE 
                u.nome ILIKE :pesquisa	
                AND u.usuario_id IN (
                    SELECT us2.usuario_id
                    FROM idiomas_usuarios us2
                    WHERE us2.idioma_id IN (
                        SELECT us3.idioma_id
                        FROM idiomas_usuarios us3
                        WHERE us3.usuario_id = :usuario_id
                    )
                )
                AND u.usuario_id <> :usuario_id
            GROUP BY 
                u.usuario_id,
                u.nome, 
                u.foto, 
                u.localizacao, 
                u.url_unica, 
                interesses
            ORDER BY u.nome
        ", [
            "pesquisa" => $dados['pesquisa'] . "%",
            "usuario_id" => $req->session()->get("usuario")->usuario_id
        ]);

        return response()->json($usuarios);
    }

    /**
     * Busca os usuários que o usuário logado segue
     */
    function getSeguindo(Request $req)
    {
        $usuarios = DB::select("
            SELECT 
                u.usuario_id,
                u.nome,
                '/storage/'||u.foto AS foto,
                u.localizacao,
                u.url_unica,
                json_agg(
                    json_build_object(
                        'idioma', i.nome,
                        'nivel_conhecimento', us.nivel_conhecimento
                    )
                ORDER BY i.nome)::TEXT AS idiomas,
                ints.nome AS interesses,
                TRUE AS seguindo
            FROM usuarios u
            JOIN idiomas_usuarios us ON
                us.usuario_id = u.usuario_id
            JOIN IDIOMAS i ON
                i.idioma_id = us.idioma_id
            LEFT JOIN (
                SELECT 
                    usuario_id, 
                    JSON_AGG(interesses.nome)::TEXT AS nome
                FROM interesses_usuarios
                JOIN interesses ON 
                    interesses_usuarios.interesse_id = interesses.interesse_id	
                GROUP BY usuario_id
            ) ints ON 
                u.usuario_id = ints.usuario_id
            WHERE 
                u.usuario_id IN (
                    SELECT c.segue
                    FROM conexoes c
                    WHERE c.seguidor = :usuario_id
                )
            GROUP BY 
                u.usuario_id,
                u.nome, 
                u.foto, 
                u.localizacao, 
                u.url_unica, 
                interesses
            ORDER BY u.nome
        ", [
            "usuario_id" => $req->session()->get("usuario")->usuario_id
        ]);

        return response()->json($usuarios);
    }

    /**
     * Busca os seguidores do usuário logado
     */
    function getSeguidores(Request $req)
    {
        $usuarios = DB::select("
            WITH eu_sigo AS (
                SELECT segue
                FROM conexoes
                WHERE seguidor = :usuario_id
            )
            SELECT 
                u.usuario_id,
                u.nome,
                '/storage/'||u.foto AS foto,
                u.localizacao,
                u.url_unica,
                json_agg(
                    json_build_object(
                        'idioma', i.nome,
                        'nivel_conhecimento', us.nivel_conhecimento
                    )
                ORDER BY i.nome)::TEXT AS idiomas,
                ints.nome AS interesses,
                CASE WHEN u.usuario_id IN (SELECT * FROM eu_sigo) THEN TRUE ELSE FALSE END AS seguindo
            FROM usuarios u
            JOIN idiomas_usuarios us ON
                us.usuario_id = u.usuario_id
            JOIN IDIOMAS i ON
                i.idioma_id = us.idioma_id
            LEFT JOIN (
                SELECT 
                    usuario_id, 
                    JSON_AGG(interesses.nome)::TEXT AS nome
                FROM interesses_usuarios
                JOIN interesses ON 
                    interesses_usuarios.interesse_id = interesses.interesse_id	
                GROUP BY usuario_id
            ) ints ON 
                u.usuario_id = ints.usuario_id
            WHERE 	
                u.usuario_id IN (
                    SELECT c.seguidor
                    FROM conexoes c
                    WHERE c.segue = :usuario_id
                )
            GROUP BY 
                u.usuario_id,
                u.nome, 
                u.foto, 
                u.localizacao, 
                u.url_unica, 
                interesses
            ORDER BY u.nome
        ", [
            "usuario_id" => $req->session()->get("usuario")->usuario_id
        ]);

        return response()->json($usuarios);
    }

    /**
     * Função que faz o usuário logado iniciar ou parar de seguir outro usuário
     */
    function seguirPararSeguir(Request $req)
    {
        $dados = $req->validate([
            "outro" => "required|integer|exists:usuarios,usuario_id",
            "seguindo" => "required"
        ]);

        $dados['seguindo'] = json_decode($dados['seguindo']);

        DB::beginTransaction();

        // Para de seguir
        if ($dados['seguindo'] === true) {
            DB::delete("
                DELETE FROM conexoes
                WHERE seguidor = :usuario_id
                AND segue = :outro
            ", [
                "usuario_id" => session("usuario")->usuario_id,
                "outro" => $dados['outro']
            ]);
        }
        // Começa a seguir
        else {
            DB::insert("
                INSERT INTO conexoes(seguidor, segue)
                VALUES(:usuario_id, :outro)
            ", [
                "usuario_id" => session("usuario")->usuario_id,
                "outro" => $dados['outro']
            ]);
        }

        DB::commit();

        return response()->json([
            "status" => "success",
        ]);
    }
}
