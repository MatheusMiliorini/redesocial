@extends("layouts.topo")

@section("meio")
<div class="container">
    <div class="col-12 col-lg-6 offset-lg-3">
        <div id="conexoes"></div>

        <div id="modalDescobrir" class="modal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Descobrir usuários</h5>
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
</div>
@endsection

@section("scripts")
<script src="{{asset('js/dist/conexoes.js')}}"></script>
@endsection