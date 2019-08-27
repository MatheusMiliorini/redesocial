@extends("layouts.auth")

@section("form")
<form>
    <div class="form-group">
        <label for="foto">Foto de perfil</label>
        <br>
        <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D" width="128px" height="128px" class="avatarPerfil" title="Clique para enviar uma nova foto">
        <input type='file' style="display: none" id="uploadAvatar" name="foto">
        <small class="form-text text-muted">Escolha uma foto de perfl para ser vista por outros usuários</small>
    </div>
    <div class="form-group">
        <label for="localizacao">Localização</label>
        <input type="text" class="form-control" placeholder="Rio do Sul, SC" name="localizacao">
    </div>
    <div class="form-group">
        <label for="nascimento">Nascimento</label>
        <input type="date" class="form-control" name="nascimento">
    </div>
    <div class="form-group">
        <label for="site">Site</label>
        <input type="text" class="form-control" placeholder="https://...." name="site">
    </div>
    <div class="form-group">
        <label for="site">Biografia</label>
        <textarea class="form-control" placeholder="Escreva um pouco sobre você..." name="biografia"></textarea>
    </div>
    <div class="form-group">
        <label for="site">URL Única</label>
        <input type="text" class="form-control" value="{{str_replace(' ', '.', strtolower(session('usuario')->nome))}}" name="url_unica">
        <small class="form-text text-muted">Esta URL poderá ser usada por outras pessoas para te localizar.</small>
    </div>

    <hr>
    <h5>Meus interesses</h5>
    <input type="text" class="form-control" id="searchInteresses">
    <small class="form-text text-muted">Busque interesses ou crie novos para melhorar o encontro de parceiros de idiomas.</small>
    <div id="wrapperInteresses">

    </div>
    <hr>
    <h5>Meus idiomas</h5>
    <input type="text" class="form-control">
    <small class="form-text text-muted">Busque os idiomas que você deseja aprender e seu nível de conhecimento.</small>
    <div id="wrapperIdiomas">

    </div>
    <div class="form-group" style="margin-top: 1rem">
        <button class="btn btn-success" style="width: 100%" id="btnFinalizar">Finalizar Cadastro</button>
    </div>
</form>
@endsection