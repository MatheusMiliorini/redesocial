@extends("layouts.auth")
@section("form")
<form>
    <div class="form-group">
        <label for="email">E-mail</label>
        <input type="text" class="form-control" id="email">
    </div>
    <div class="form-group">
        <button type="button" class="btn btn-success" style="width: 100%" id="btnRecuperarSenha">Enviar e-mail</button>
    </div>
    <a href="/login">Voltar</a>
</form>
@endsection