<?php

namespace App\Http\Controllers;

use App\Models\Idioma;
use Illuminate\Http\Request;

class IdiomasController extends Controller
{
    /**
     * Retorna uma lista de todos os idiomas
     */
    public function getIdiomas()
    {
        $idiomas = [];
        foreach (Idioma::all()->sortBy("nome") as $idioma) {
            $idiomas[] = $idioma;
        }
        return response()->json($idiomas);
    }
}
