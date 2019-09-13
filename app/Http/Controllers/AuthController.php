<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Retorna a view de login (GET)
     */
    public function login()
    {
        return view("login", [
            "title" => "Login",
        ]);
    }

    public function cadastro()
    {
        return view("cadastro", [
            "title" => "Cadastro",
        ]);
    }

    /**
     * Seta a sessão
     */
    public function iniciaSessao(Request $req)
    {
        $usuario = Usuario::where("email", $req->email)->first();
        if ($usuario && Hash::check($req->senha, $usuario->senha)) {
            session([
                "usuario" => $usuario
            ]);
            return response()->json([
                "completou_login" => $usuario->completou_login
            ]);
        } else {
            return response()->json([
                "erro" => "Usuário não localizado!",
            ], 404);
        }
    }

    /**
     * Cadastra inicialmente um usuário no banco de dados
     */
    public function insereUsuario(Request $req)
    {
        $req->validate([
            "email" => "required|unique:usuarios",
            "nome"  => "required",
            "senha" => "required"
        ], [
            "email.unique" => "Este e-mail já se encontra em uso!"
        ]);

        $usuario = new Usuario();
        $usuario->fill($req->all());
        $usuario->senha = Hash::make($req->senha);
        $usuario->save();

        session([
            "usuario" => $usuario
        ]);

        return response()->json([
            "status" => "success"
        ]);
    }

    /**
     * Recebe o GET (retorna a view)
     */
    public function completarCadastro(Request $req)
    {
        return view("completarCadastro", [
            "title" => "Completar cadastro"
        ]);
    }

    /**
     * Recebe o POST (insere os dados)
     */
    public function completarCadastroPost(Request $req)
    {
        $dados = $req->validate([
            "foto"               => "nullable|image",
            "localizacao"        => "nullable|string",
            "nascimento"         => "nullable|date",
            "site"               => "nullable|string",
            "biografia"          => "nullable|string",
            "url_unica"          => "required|string|unique:usuarios",
            "interesse_id"       => "required|array|exists:interesses",
            "idioma_id"          => "required|array|exists:idiomas",
            "nivel_conhecimento" => "required|array|between:1,5"
        ], [
            "url_unica.required"    => "Por favor, escolha uma URL única para seu perfil.",
            "url_unica.unique"      => "Desculpe, essa URL única já se encontra em uso.",
            "interesse_id.required" => "Por favor, selecione ao menos um interesse.",
            "idioma_id.required"    => "Por favor, selecione ao menos um idioma.",
            "foto.image"            => "Por favor, escolha uma imagem válida.",
        ]);

        DB::beginTransaction();

        $usuario = Usuario::find($req->session()->get('usuario')->usuario_id);
        $usuario->fill($dados);
        if (isset($dados['foto'])) {
            $usuario->foto = $dados['foto']->store('avatares');
        }
        $usuario->completou_login = true;
        $usuario->save();

        // Insere os interesses
        $inserts = [];
        foreach ($dados['interesse_id'] as $interesse) {
            $inserts[] = ["usuario_id" => $usuario->usuario_id, "interesse_id" => $interesse];
        }
        DB::table("interesses_usuarios")->insert($inserts);

        // Insere os idiomas
        $inserts = [];
        foreach ($dados['idioma_id'] as $key => $idioma) {
            $inserts[] = [
                "usuario_id" => $usuario->usuario_id,
                "idioma_id"  => $idioma,
                "nivel_conhecimento" => $dados['nivel_conhecimento'][$key]
            ];
        }
        DB::table("idiomas_usuarios")->insert($inserts);

        DB::commit();
    }

    public function logout(Request $req)
    {
        $req->session()->flush();
        return redirect("/login");
    }
}
