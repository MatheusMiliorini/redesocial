<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * Retorna a view de login (GET)
     */
    public function login()
    {
        return view("login");
    }

    public function cadastro()
    {
        return view("cadastro");
    }

    public function iniciaSessao(Request $req)
    {
        $usuario = Usuario::where("email", $req->email)->where("senha", $req->senha)->first();
        if ($usuario) {
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
            "email" => "required|unique:usuarios"
        ], [
            "email.unique" => "Este e-mail já se encontra em uso!"
        ]);

        $usuario = new Usuario();
        $usuario->fill($req->all());
        $usuario->save();

        return response()->json([
            "status" => "success"
        ]);
    }

    public function completarCadastro(Request $req)
    {
        return view("completarCadastro");
    }

    public function logout(Request $req) {
        $req->session()->destroy();
        return response()->json([
            "msg" => "Sessão finalizada com sucesso!",
        ]);
    }
}
