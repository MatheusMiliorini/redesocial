@extends("layouts.topo")

@section("meio")
<div class="container">
    <div id="feed"></div>
</div>
@endsection

@section("scripts")
<script>
    // Constantes
    const avatar = "{{asset("/storage/" . session('usuario')->foto)}}";
</script>
<script src="{{asset('js/dist/feed.js')}}"></script>
@endsection