@extends("layouts.auth")
@section("form")
<form>
    <div class="form-group">
        <label for="email">Nova senha</label>
        <input type="password" class="form-control" id="senha">
        <label for="email">Confirmar nova senha</label>
        <input type="password" class="form-control" id="senha2">
    </div>
    <div class="form-group">
        <button type="button" class="btn btn-success" style="width: 100%" id="btnSalvarSenha">Salvar senha</button>
    </div>
    <a href="/login">Voltar</a>
</form>
@endsection

@section('scripts')
<script>
    const token_recuperacao = "{{$token}}"
</script>
@endsection