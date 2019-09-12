@extends("layouts.auth")

@section("form")
<form id="formCompletarCadastro">
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
        <small class="form-text text-muted">A localização sugerida é baseada no endereço IP atual.</small>
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
        @php
        $url_unica = str_replace(' ', '.', strtolower(session('usuario')->nome));
        @endphp
        <input type="text" class="form-control" placeholder="{{$url_unica}}" value="{{$url_unica}}" name="url_unica">
        <small class="form-text text-muted">Esta URL poderá ser usada por outras pessoas para te localizar.</small>
    </div>

    <hr>

    <label for="searchInteresses">Meus interesses</label>
    <div class="addAutocomplete">Adicionar "<span id="sugestaoInteresse"></span>" <i class="far fa-plus-square"></i></div>
    <input type="text" class="form-control" id="searchInteresses">
    <small class="form-text text-muted">Busque interesses ou crie novos para melhorar o encontro de parceiros de idiomas.</small>
    <div id="wrapperInteresses"></div>

    <hr>

    <label>Meus idiomas</label>
    <div id="seletorIdiomas"></div>
    <div class="form-group" style="margin-top: 1rem">
        <button type="button" class="btn btn-success" style="width: 100%" id="btnFinalizar">Finalizar Cadastro</button>
    </div>
</form>

<script src="{{asset('js/dist/completarcadastro.js')}}"></script>
@endsection
