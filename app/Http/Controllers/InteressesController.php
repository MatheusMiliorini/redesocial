<?php

namespace App\Http\Controllers;

use App\Models\Interesse;
use Illuminate\Http\Request;

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
}
