$("#btnCadastrar").click(function (e) {
    e.preventDefault();
    const email = $("#email").val(),
        senha = $("#senha").val(),
        nome = $("#nome").val();

    if (email === "") {
        $("#email").addClass("is-invalid");
        return;
    } else if (senha === "") {
        $("#senha").addClass("is-invalid");
        return;
    } else if (nome === "") {
        $("#nome").addClass("is-invalid");
        return;
    }

    $.ajax({
        url: "/cadastro",
        method: "POST",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        data: $('form').serialize(),
        success() {
            swal({
                title: "Sucesso!",
                icon: "success",
                text: "Vamos para a próxima etapa!",
            });
            setTimeout(() => {
                // Redireciona para a próxima etapa do cadastro
            }, 2000);
        },
        error(data) {
            data = data.responseJSON;
            if (data.errors.email) {
                swal({
                    title: "Oops",
                    icon: "error",
                    text: data.errors.email[0],
                })
            } else {
                swal({
                    title: "Oops",
                    icon: "error",
                    text: "Ocorreu um erro ao relizar o cadastro inicial",
                })
            }
        }
    })
});

$("#btnLogar").click(function (e) {
    e.preventDefault();
    const email = $("#email").val(),
        senha = $("#senha").val();

    if (email === "") {
        $("#email").addClass("is-invalid");
        return;
    } else if (senha === "") {
        $("#senha").addClass("is-invalid");
        return;
    }

    $.ajax({
        url: "/login",
        method: "POST",
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        },
        data: {
            email,
            senha
        },
        success() {

        },
        error() {
            swal({
                title: "Oops",
                icon: "error",
                text: "Ocorreu um erro ao relizar o login"
            })
        }
    })
});