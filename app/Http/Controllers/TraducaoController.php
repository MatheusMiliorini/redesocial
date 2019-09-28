<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Google\Cloud\Translate\TranslateClient;

class TraducaoController extends Controller
{

    /**
     * Busca o nome original do idioma com base no código
     * @param TranslateClient $translate
     * @param string $code
     * @return string Nome da língua
     */
    private function getLanguageName($translate, $code)
    {
        $linguas = $translate->localizedLanguages();
        $nomeLingua = null;
        for ($i = 0; $i < sizeof($linguas); $i++) {
            if ($linguas[$i]['code'] === $code) {
                $nomeLingua = $linguas[$i]['name'];
                break;
            }
        }
        return $nomeLingua;
    }
    /**
     * Identifica o idioma e traduz um texto para português
     */
    function traduzir(Request $req)
    {
        $texto = $req->texto;
        $translate = new TranslateClient([
            'key' => env('TRANSLATE_API_KEY'),
            'target' => 'pt-br'
        ]);

        $traduzido = $translate->translate($texto);
        $nomeLingua = $this->getLanguageName($translate, $traduzido['source']);
        $traduzido['source'] = $nomeLingua ? $nomeLingua : $traduzido['source'];

        return response()->json($traduzido);
    }
}
