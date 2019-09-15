<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    $usuario = session('usuario');
    if (is_null($usuario)) {
        return redirect('/login');
    } else {
        return redirect('/feed');
    }
});

Route::get("/login", "AuthController@login");
Route::post("/login", "AuthController@iniciaSessao");
Route::get("/cadastro", "AuthController@cadastro");
Route::post("/cadastro", "AuthController@insereUsuario");

Route::middleware(['UserLogged'])->group(function () {
    Route::get("/completarcadastro", "AuthController@completarCadastro");
    Route::post("/completarcadastro", "AuthController@completarCadastroPost");

    Route::prefix("/feed")->group(function () {
        Route::get("/", 'FeedController@mostraFeed');
        Route::get("/publicacoes", 'FeedController@getPublicacoes');
        Route::post("/publicacoes", 'FeedController@addPublicao');
    });

    Route::prefix("/conexoes")->group(function () {
        Route::get("/", "ConexoesController@telaConexoes");
        Route::post("/", "ConexoesController@seguirPararSeguir");
        Route::get("/seguindo", "ConexoesController@getSeguindo");
        Route::get("/seguidores", "ConexoesController@getSeguidores");
        Route::get("/buscaUsuarios", "ConexoesController@buscaUsuarios");
    });

    Route::prefix("/interesses")->group(function () {
        Route::get("/", "InteressesController@getInteresses");
        Route::post("/", "InteressesController@addInteresse");
    });

    Route::prefix("/idiomas")->group(function () {
        Route::get("/", "IdiomasController@getIdiomas");
    });
});


Route::get("/logout", "AuthController@logout");
