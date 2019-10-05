<!DOCTYPE html>
<html lang="pt-br" style="height: 100%">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <link rel="manifest" href="/manifest.json">
    <!-- CODELAB: Add iOS meta tags and icons -->
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <meta name="apple-mobile-web-app-title" content="Rede Social">
    <link rel="apple-touch-icon" href="/images/icons/icon512.png">
    <meta name="description" content="Rede social para estudantes de idiomas">
    <meta name="theme-color" content="#15202b" />

    <title>{{$title}}</title>

    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.css" integrity="sha256-p6xU9YulB7E2Ic62/PX+h59ayb3PBJ0WFTEQxq0EjHw=" crossorigin="anonymous" />
    <link rel="stylesheet" href="{{asset('css/topo.css')}}">
    <link rel="stylesheet" href="{{asset('css/fontawesome-all.min.css')}}" />

    @yield("styles")
</head>

<body>
    <ul class="nav">
        <li class="nav-item {{$title === 'Feed' ? 'nav-item-selected' : ''}}" title="Meu Feed">
            <a href="/feed">
                <i class="fas fa-home"></i>
            </a>
        </li>
        <li class="nav-item" title="Minhas conversas">
            <i class="fas fa-comments"></i>
        </li>
        <li class="nav-item {{$title === 'Conexões' ? 'nav-item-selected' : ''}}" title="Minhas Conexões">
            <a href="/conexoes">
                <i class="fas fa-user-friends"></i>
            </a>
        </li>
        <li class="nav-item {{$title === 'Meu Perfil' ? 'nav-item-selected' : ''}}" title="Meu Perfil">
            <a href="/meuPerfil">
                <i class="fas fa-user"></i>
            </a>
        </li>
        <li class="nav-item" title="Sair">
            <a href="/logout">
                <i class="fas fa-sign-out-alt"></i>
            </a>
        </li>
    </ul>


    @yield("meio")

    <script src="https://code.jquery.com/jquery-3.3.1.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js" integrity="sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
    <!-- https://sweetalert.js.org/ -->
    <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.js" integrity="sha256-T0Vest3yCU7pafRw9r+settMBX6JkKN06dqBnpQ8d30=" crossorigin="anonymous"></script>
    <script src="{{asset('js/topo.js')}}"></script>

    @yield("scripts")
</body>

</html>