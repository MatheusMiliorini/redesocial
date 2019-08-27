@extends("layouts.auth")
@section("form")
<form>
    <div class="form-group">
        <label for="email">E-mail</label>
        <input type="text" class="form-control" id="email">
    </div>
    <div class="form-group">
        <label for="senha">Senha</label>
        <input type="password" class="form-control" id="senha">
    </div>
    <div class="form-group">
        <button class="btn btn-success" style="width: 100%" id="btnLogar">Logar</button>
    </div>
    <a href="/cadastro">Não tenho conta</a>
</form>
@endsection