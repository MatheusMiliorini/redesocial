@extends("layouts.topo")

@section("meio")
<div class="container">
    <div class="col-12 col-lg-6 offset-lg-3">
        <form id="formCompletarCadastro">
            <div class="form-group">
                <label for="foto">Foto de perfil</label>
                <br>
                <img src="{{$usuario->foto}}" style="border: none" width="128px" height="128px" class="avatarPerfil" title="Clique para enviar uma nova foto">
                <input type='file' style="display: none" id="uploadAvatar" name="foto">
                <small class="form-text text-muted">Escolha uma foto de perfl para ser vista por outros usuários</small>
            </div>
            <div class="form-group">
                <label for="localizacao">Localização</label>
                <input type="text" class="form-control" placeholder="Rio do Sul, SC" name="localizacao" value="{{$usuario->localizacao}}">
                <small class="form-text text-muted">A localização sugerida é baseada no endereço IP atual.</small>
            </div>
            <div class="form-group">
                <label for="nascimento">Nascimento</label>
                <input type="date" class="form-control" name="nascimento" value="{{$usuario->nascimento}}">
            </div>
            <div class="form-group">
                <label for="site">Site</label>
                <input type="text" class="form-control" placeholder="https://...." name="site" value="{{$usuario->site}}">
            </div>
            <div class="form-group">
                <label for="site">Biografia</label>
                <textarea class="form-control" placeholder="Escreva um pouco sobre você..." name="biografia">{{$usuario->biografia}}</textarea>
            </div>
            <div class="form-group">
                <label for="site">URL Única</label>
                <input type="text" class="form-control" placeholder="{{$usuario->url_unica}}" value="{{$usuario->url_unica}}" name="url_unica">
                <small class="form-text text-muted">Esta URL poderá ser usada por outras pessoas para te localizar.</small>
            </div>

            <div class="form-group" style="margin-top: 1rem">
                <label for="novasenha">Nova senha:</label>
                <input type="password" class="form-control" name="novasenha" id="novasenha">
                <small class="form-text text-muted">Deixe em branco caso não deseje alterá-la.</small>
                
                <label for="novasenha">Confirmar nova senha:</label>
                <input type="password" class="form-control" name="novasenhaconfirm" id="novasenhaconfirm">
            </div>

            <hr>

            <label for="searchInteresses">Meus interesses</label>
            <div class="addAutocomplete">Adicionar "<span id="sugestaoInteresse"></span>" <i class="far fa-plus-square"></i></div>
            <input type="text" class="form-control" id="searchInteresses">
            <small class="form-text text-muted">Busque interesses ou crie novos para melhorar o encontro de parceiros de idiomas.</small>
            <div id="wrapperInteresses">
                @foreach ($interesses as $int)
                <div class="escolhaMiniatura" title="Clique para remover" data-interesse-id="{{$int->interesse_id}}">{{$int->nome}}</div>
                @endforeach
            </div>
            <hr>

            <label>Meus idiomas</label>
            <div id="seletorIdiomas"></div>

            <div class="form-group" style="margin-top: 1rem">
                <button type="button" class="btn btn-success" style="width: 100%" id="btnFinalizar">Alterar perfil</button>
            </div>
        </form>
    </div>
</div>

<script src="{{asset('js/dist/completarcadastro.js')}}"></script>
@endsection

@section('scripts')
<script src="{{asset('js/meuPerfil.js')}}"></script>
@endsection

@section('styles')
<link rel="stylesheet" href="{{asset('css/auth.css')}}">
<style>
    .escolhaMiniatura {
        background-color: var(--mostarda);
    }
</style>
@endsection