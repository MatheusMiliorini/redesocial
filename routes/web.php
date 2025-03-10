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

Route::get('/recuperarSenha', 'AuthController@recuperarSenha'); // Form para inserir e-mail
Route::get('/recuperarSenha/{token}', 'AuthController@recuperarSenhaToken'); // Form para mudar senha
Route::post('/recuperarSenha', 'AuthController@recuperarSenhaPost'); // Envia o e-mail
Route::put('/recuperarSenha', 'AuthController@recuperarSenhaPut');   // Atualiza a senha

Route::middleware(['UserLogged'])->group(function () {
    Route::get("/completarcadastro", "AuthController@completarCadastro");
    Route::post("/completarcadastro", "AuthController@completarCadastroPost");

    Route::post("/traduzir", 'TraducaoController@traduzir');

    Route::get("/meuPerfil", 'AuthController@meuPerfil');
    Route::post("/meuPerfil", 'AuthController@alteraPerfil');
    Route::get("/meuPerfil/idiomas", 'AuthController@meusIdiomas'); // Usado no React

    Route::get("/perfil/{url_unica}", 'AuthController@visitaPerfil');
    Route::get("/perfil/{url_unica}/getAll", 'AuthController@getAll'); // Pega os dados do usuários visitado

    Route::prefix("/feed")->group(function () {
        Route::get("/", 'FeedController@mostraFeed');
        Route::prefix("/publicacoes")->group(function () {
            Route::get("/", 'FeedController@getPublicacoes');
            Route::post("/", 'FeedController@addPublicao');

            Route::delete("/{publicacao_id}", 'FeedController@deletaPublicao');
            Route::get("/{publicacao_id}/comentarios", 'FeedController@getComentarios');
            Route::post("/{publicacao_id}/comentar", 'FeedController@salvaComentario');
            Route::delete("/comentario/{rp_id}", 'FeedController@excluiComentario');

            Route::post("/curtir/{publicacao_id}", 'FeedController@curtirPublicacao');
        });
    });

    Route::prefix("/conexoes")->group(function () {
        Route::get("/", "ConexoesController@telaConexoes");
        Route::post("/", "ConexoesController@seguirPararSeguir");
        Route::get("/seguindo", "ConexoesController@getSeguindo");
        Route::get("/seguidores", "ConexoesController@getSeguidores");
        Route::get("/buscaUsuarios", "ConexoesController@buscaUsuarios");
        Route::post("/buscaUsuarios", "ConexoesController@buscaUsuariosAvancado");
    });

    Route::prefix("/interesses")->group(function () {
        Route::get("/meus", "InteressesController@getMeusInteresses");
        Route::get("/", "InteressesController@getInteresses");
        Route::post("/", "InteressesController@addInteresse");
    });

    Route::prefix("/idiomas")->group(function () {
        Route::get("/", "IdiomasController@getIdiomas");
    });

    Route::prefix("/conversas")->group(function () {
        Route::get("/", "ConversasController@listaConversas");
        Route::get("/mensagens/{conversa_id}", "ConversasController@getMensagens");
        Route::post("/mensagens", "ConversasController@enviaMensagem");
        Route::get("/lista", "ConversasController@getConversas");
        Route::post("/iniciar", "ConversasController@iniciarConversa");
        Route::post("/correcoes", "ConversasController@corrigeMensagem");
    });
});


Route::get("/logout", "AuthController@logout");
