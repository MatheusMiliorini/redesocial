<?php

namespace App\Http\Controllers;

use App\Models\Interesse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InteressesController extends Controller
{
    public function getInteresses(Request $req)
    {
        $interesses = Interesse::where("nome", "ilike", '%' . $req->get("busca") . '%')->get();

        return json_encode($interesses);
    }

    public function addInteresse(Request $req)
    {
        $interesse = new Interesse();
        $interesse->fill($req->all());
        $interesse->save();

        return response()->json($interesse);
    }

    /**
     * Retorna os interesses do usuário logado
     */
    public function getMeusInteresses()
    {
        return DB::select("
            SELECT
                i.*,
                false AS marcado
            FROM
                interesses i
            JOIN interesses_usuarios iu ON
                iu.interesse_id = i.interesse_id
            WHERE
                iu.usuario_id = :usuario_id
            ORDER BY
                i.nome
        ", [
            session('usuario')->usuario_id
        ]);
    }
}
