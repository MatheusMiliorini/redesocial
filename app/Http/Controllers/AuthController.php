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

    public function cadastro() {
        return view ("cadastro");
    }

    public function iniciaSessao(Request $req) {
        $usuario = Usuario::where("email", $req->email)->where("senha", $req->senha)->first();
        if ($usuario) {

        } else  {
            
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
}
