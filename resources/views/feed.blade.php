@extends("layouts.topo")

@section("meio")
<div class="container">
    <div id="feed"></div>

    <div id="modalComentarios" class="modal" tabindex="-1" role="dialog">
        <div class="modal-dialog" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Comentários</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div id="corpoModal"></div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@section("scripts")
<script src="{{asset('js/dist/feed.js')}}"></script>
@endsection