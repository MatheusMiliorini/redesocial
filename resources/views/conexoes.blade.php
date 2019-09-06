@extends("layouts.topo")

@section("meio")
<div class="container">
    <div class="col-12 col-lg-6 offset-lg-3">
        <div id="conexoes"></div>
    </div>
</div>
@endsection

@section("scripts")
<script src="{{asset('js/dist/conexoes.js')}}"></script>
@endsection