@extends("layouts.auth")
@section("form")
<form>
    <div class="form-group">
        <label for="nome">Nome</label>
        <input type="text" class="form-control" name="nome" id="nome">
    </div>
    <div class="form-group">
        <label for="email">E-mail</label>
        <input type="text" class="form-control" id="email" name='email'>
    </div>
    <div class="form-group">
        <label for="senha">Senha</label>
        <input type="password" class="form-control" id="senha" name='senha'>
    </div>
    <div class="form-group">
        <button class="btn btn-success" style="width: 100%" id="btnCadastrar">Continuar</button>
    </div>
    <a href="/login">Já tenho conta</a>
</form>
@endsection